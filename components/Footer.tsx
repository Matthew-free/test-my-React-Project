import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 pt-8 pb-8 border-t border-white/10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-gray-400 text-sm">
          &copy; {currentYear} 나만의 웹사이트. All rights reserved.
        </div>
        <div className="flex space-x-6 text-sm">
          <a href="#" className="text-gray-500 hover:text-white transition-colors">
            소개
          </a>
          <a href="#" className="text-gray-500 hover:text-white transition-colors">
            이용약관
          </a>
          <a href="#" className="text-gray-500 hover:text-white transition-colors">
            개인정보처리방침
          </a>
          <a href="#" className="text-gray-500 hover:text-white transition-colors">
            문의하기
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;