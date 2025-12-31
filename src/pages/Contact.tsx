import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().optional(),
  email: z.string().optional(),
  location: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
  contactMethod: z.enum(['whatsapp', 'email'], {
    required_error: 'Please select how you would like to be contacted',
  }),
}).refine((data) => {
  if (data.contactMethod === 'whatsapp') {
    return data.phone && data.phone.length >= 10;
  }
  return true;
}, {
  message: 'Phone number is required when choosing WhatsApp',
  path: ['phone'],
}).refine((data) => {
  if (data.contactMethod === 'email') {
    return data.email && z.string().email().safeParse(data.email).success;
  }
  return true;
}, {
  message: 'Valid email is required when choosing Email',
  path: ['email'],
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      location: '',
      message: '',
      contactMethod: undefined,
    },
  });

  const contactMethod = form.watch('contactMethod');

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Get inverter sizing data from sessionStorage if available
      const storedData = sessionStorage.getItem('inverterSizingData');
      const inverterSizing = storedData ? JSON.parse(storedData) : null;

      const { error } = await supabase
        .from('contact_submissions')
        .insert({
          name: data.name,
          phone: data.phone || null,
          email: data.email || null,
          location: data.location || null,
          message: data.message,
          contact_method: data.contactMethod,
          inverter_sizing: inverterSizing,
        });

      if (error) throw error;

      // Send email notification
      try {
        await supabase.functions.invoke('send-contact-notification', {
          body: {
            name: data.name,
            email: data.email || null,
            phone: data.phone || null,
            location: data.location || null,
            message: data.message,
            contactMethod: data.contactMethod,
            inverterSizing: inverterSizing,
          },
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail the form submission if email fails
      }

      setShowConfirmation(true);
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact an Expert - InverterSize</title>
        <meta 
          name="description" 
          content="Get expert guidance on your solar inverter setup. Contact our qualified engineers for professional advice." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header with back button */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/')}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-display text-xl font-bold text-foreground">
                  Contact an Expert
                </h1>
                <p className="text-xs text-muted-foreground">
                  Get professional guidance
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl">Send us a message</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Get expert guidance, avoid costly mistakes, and install the right system the first time.
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How would you like to be contacted? *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="whatsapp" id="whatsapp" />
                              <Label htmlFor="whatsapp" className="cursor-pointer">WhatsApp</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="email" id="email" />
                              <Label htmlFor="email" className="cursor-pointer">Email</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {contactMethod === 'whatsapp' && (
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="+234 xxx xxx xxxx" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {contactMethod === 'email' && (
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City, State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your power needs and any questions you have..."
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md flex flex-col items-center text-center">
          <DialogHeader className="flex flex-col items-center text-center w-full">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <DialogTitle className="text-xl text-center">Message Sent Successfully!</DialogTitle>
            <DialogDescription className="text-center">
              Thank you for reaching out. Our expert team will contact you shortly via your preferred method.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button onClick={() => setShowConfirmation(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Contact;
