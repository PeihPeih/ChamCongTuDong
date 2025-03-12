import { Layout } from "antd";
import React, { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import HeaderComponent from "../components/Header";

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sidebar />
            <Layout>
                <HeaderComponent />
                {children}
            </Layout>
        </Layout>
    );
};

export default MainLayout;
