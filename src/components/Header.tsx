import { memo, useState } from 'react';
import { Menu, Zap, Calculator, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.svg';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

export const Header = memo(function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleShareTool = async () => {
    const shareData = {
      title: 'InverterSize Calculator',
      text: 'Calculate the right inverter size for your home or business with this smart tool!',
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        toast({
          title: 'Link copied!',
          description: 'Share this link with others to help them size their inverter.',
        });
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.origin);
        toast({
          title: 'Link copied!',
          description: 'Share this link with others to help them size their inverter.',
        });
      }
    }
    setIsOpen(false);
  };

  const menuItems = [
    {
      label: 'Professional Only',
      icon: Calculator,
      href: '/professional',
    },
  ];

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
              <img src={logo} alt="InverterSize Logo" className="relative h-10 w-10" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                InverterSize
              </h1>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span>Real-time calculations</span>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-2">
              {menuItems.map((item) => (
                <Button key={item.label} variant="ghost" size="sm" asChild>
                  <Link to={item.href} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              ))}
              <Button variant="ghost" size="sm" onClick={handleShareTool} className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share Tool
              </Button>
            </nav>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-6">
                  {menuItems.map((item) => (
                    <Button
                      key={item.label}
                      variant="ghost"
                      className="justify-start gap-3 h-12"
                      asChild
                      onClick={() => setIsOpen(false)}
                    >
                      <Link to={item.href}>
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    className="justify-start gap-3 h-12"
                    onClick={handleShareTool}
                  >
                    <Share2 className="h-5 w-5" />
                    Share Tool
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
});
