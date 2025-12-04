import React from 'react';
import { Outlet } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar';
import Footer from '../../components/Footer';                   // 기존 푸터 컴포넌트 경로 맞춰주기

const Layout = () => {
  return (
    <div>
      <NavigationBar />
      <Outlet /> {/* 이 부분에 페이지별 콘텐츠가 렌더링됩니다. */}
      <Footer />
    </div>
  );
};

export default Layout;