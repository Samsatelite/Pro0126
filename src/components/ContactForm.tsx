import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  phone: z.string().trim().max(20, 'Phone number is too long').optional(),
  email: z.string().trim().max(255, 'Email is too long').optional(),
  location: z.string().trim().max(200, 'Location must be less than 200 characters').optional(),
  message: z.string().trim().min(1, 'Message is required').max(1000, 'Message must be less than 1000 characters'),
  contactMethod: z.enum(['whatsapp', 'email'], { required_error: 'Please select how you\'d like to be reached' }),
}).refine((data) => {
  if (data.contactMethod === 'whatsapp') {
    return data.phone && data.phone.length >= 10;
  }
  return true;
}, {
  message: 'Phone number is required for WhatsApp contact',
  path: ['phone'],
}).refine((data) => {
  if (data.contactMethod === 'email') {
    return data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
  }
  return true;
}, {
  message: 'Valid email is required for email contact',
  path: ['email'],
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
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

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Build message for WhatsApp or mailto
      const messageBody = `
Name: ${data.name}
${data.phone ? `Phone: ${data.phone}` : ''}
${data.email ? `Email: ${data.email}` : ''}
${data.location ? `Location: ${data.location}` : ''}
Preferred Contact: ${data.contactMethod === 'whatsapp' ? 'WhatsApp' : 'Email'}

Message:
${data.message}
      `.trim();

      if (data.contactMethod === 'whatsapp') {
        const encodedMessage = encodeURIComponent(messageBody);
        window.open(`https://wa.me/2349074243753?text=${encodedMessage}`, '_blank');
      } else {
        const encodedSubject = encodeURIComponent('Inverter Calculator Inquiry');
        const encodedBody = encodeURIComponent(messageBody);
        window.open(`mailto:devidfirm@gmail.com?subject=${encodedSubject}&body=${encodedBody}`, '_blank');
      }

      toast({
        title: 'Message prepared!',
        description: `Your message has been prepared for ${data.contactMethod === 'whatsapp' ? 'WhatsApp' : 'email'}.`,
      });

      form.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <FormLabel>How would you like to be reached? *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="whatsapp" id="whatsapp" />
                    <label htmlFor="whatsapp" className="text-sm cursor-pointer">WhatsApp</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email" />
                    <label htmlFor="email" className="text-sm cursor-pointer">Email</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Phone Number {contactMethod === 'whatsapp' && '*'}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Your phone number" 
                  type="tel"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email {contactMethod === 'email' && '*'}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Your email address" 
                  type="email"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Your city or state (optional)" {...field} />
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
                  placeholder="Tell us about your power needs..." 
                  className="min-h-[80px] resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Send Message
        </Button>
      </form>
    </Form>
  );
}
