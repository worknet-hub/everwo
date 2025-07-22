import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Menu, 
  Home, 
  MessageCircle, 
  Users, 
  Bell, 
  User,
  Settings,
  LogOut,
  Briefcase
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

const MobileHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { unreadCount } = useRealtimeNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  // Remove useEffect and hidden state

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
    setIsOpen(false);
  };

  const navigation = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Messages', path: '/messages', icon: MessageCircle },
    { name: 'Connections', path: '/connections', icon: Users },
    { name: 'View Communities', path: '/communities', icon: Briefcase },
  ];

  const userMenu = [
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden sticky top-0 z-50 header-dark mobile-header bg-[#000000]">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          {/* <img src="/logo.webp" alt="Logo" className="h-12 w-24 object-contain" style={{ maxHeight: '48px', marginLeft: '-8px' }} loading="lazy" /> */}
          <span className="font-bold text-2xl text-white tracking-widest">EVERWO</span>
        </Link>

        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-14 w-14 text-gray-400 hover:text-white hover:bg-[#2a2f3e] relative">
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  </div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              side="bottom" 
              align="end"
              className="w-[calc(100vw-2rem)] max-w-sm bg-black/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl" 
              sideOffset={8}
            >
              <NotificationsPanel />
            </PopoverContent>
          </Popover>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-14 w-14 text-gray-400 hover:text-white hover:bg-[#2a2f3e]">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-black/80 backdrop-blur-md border-none mobile-sidebar">
              <div className="flex flex-col h-full">
                {/* User Profile Section */}
                {user && (
                  <div className="flex items-center space-x-3 pb-6">
                    {/* Avatar removed as per request */}
                    <div className="flex-1">
                      <p className="font-medium text-white">{user.email?.split('@')[0]}</p>
                      <p className="text-sm text-gray-400">Student</p>
                    </div>
                  </div>
                )}

                <Separator className="mb-6 bg-[#2a2f3e]" />

                {/* Navigation */}
                <div className="flex-1 space-y-2">
                  {navigation.map((item) => {
                    if (item.name === 'View Communities') {
                      return (
                        <div
                          key={item.name}
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 bg-[#18181b] opacity-60 cursor-not-allowed select-none"
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.name}</span>
                          <span className="ml-2 text-xs text-gray-500">coming soon</span>
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                          location.pathname === item.path
                            ? 'bg-white text-black'
                            : 'text-gray-300 hover:text-white hover:bg-[#2a2f3e]'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}

                  {userMenu.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-[#2a2f3e] transition-colors"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}

                  {/* Add Privacy Policy, About, Help */}
                  <Separator className="my-6 bg-[#2a2f3e]" />
                  <Link
                    to="/privacy-policy"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-[#2a2f3e] transition-colors"
                  >
                    <span>Privacy Policy</span>
                  </Link>
                  <Link
                    to="/about"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-[#2a2f3e] transition-colors"
                  >
                    <span>About</span>
                  </Link>
                  <Link
                    to="/help"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-[#2a2f3e] transition-colors"
                  >
                    <span>Help</span>
                  </Link>
                </div>

                {/* Sign Out */}
                {user && (
                  <div className="pt-6 border-t border-[#2a2f3e]">
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
