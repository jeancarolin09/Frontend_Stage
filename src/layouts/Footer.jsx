import React from 'react';
import { 
Heart
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-white py-6 border-t border-gray-200 shadow-md">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500 text-sm">
            &copy; 2025 EventPlanner. Tous droits réservés.
        </p>
        <p className="text-center text-gray-500 text-sm mt-2">
            Made with <Heart size={14} className="inline text-red-500 mx-0.5" /> in Madagascar
        </p>
    </div>
</footer>
    // {/* Footer */}
    //     <div className="text-center text-gray-600">
    //       <p className="text-sm">© 2025 EventPlanner. Tous droits réservés.</p>
    //       <p className="text-sm mt-2">Made with <Heart size={14} className="inline text-red-500" /> in Madagascar</p>
    //     </div>
  );
};

export default Footer;
