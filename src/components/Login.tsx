import { Dumbbell } from 'lucide-react';

interface LoginProps {
  onLogin: (isAdmin: boolean) => void;
}

export function Login({ onLogin }: LoginProps) {
  return (
    <div className="min-h-screen bg-background-light flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary">
          <Dumbbell size={56} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-secondary tracking-tight">
          Sign in to Dhaka Fit & Flex
        </h2>
        <p className="mt-2 text-center text-sm text-accent">
          Welcome back! Please enter your details.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(false); }}>
            <div>
              <label className="block text-sm font-bold text-secondary">Email address</label>
              <div className="mt-1">
                <input 
                  type="email" 
                  defaultValue="arif@example.com"
                  required 
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm font-medium text-secondary" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary">Password</label>
              <div className="mt-1">
                <input 
                  type="password" 
                  defaultValue="password123"
                  required 
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm font-medium text-secondary" 
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-accent font-medium">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-bold text-primary hover:text-primary/80">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => onLogin(false)} 
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-secondary bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Sign in as Member
              </button>
              <button 
                type="button" 
                onClick={() => onLogin(true)} 
                className="w-full flex justify-center py-3 px-4 border-2 border-secondary rounded-xl shadow-sm text-sm font-bold text-secondary bg-transparent hover:bg-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors"
              >
                Sign in as Admin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
