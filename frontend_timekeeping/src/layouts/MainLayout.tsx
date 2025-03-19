import { Layout } from "antd";
import React, { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import HeaderComponent from "../components/Header";

interface MainLayoutProps {
    title: string;
    children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ title, children }) => {
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sidebar />
            <Layout>
                <HeaderComponent title={title}/>
                {children}
            </Layout>
        </Layout>
    );
};

export default MainLayout;
