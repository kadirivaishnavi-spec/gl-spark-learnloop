import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function AppLayout({ children }: { children: ReactNode }) {
    return (
        <div className="app-layout">
            <Navbar />

            <div className="app-body">
                <Sidebar />

                <main className="app-content">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AppLayout;