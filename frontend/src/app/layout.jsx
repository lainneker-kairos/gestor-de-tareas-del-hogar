import './globals.css';
import { NotificationProvider } from '../context/notification';
import Topbar from '../components/topbar';
import Navbar from '../components/navbar';
import Footer from '../components/footer';

export const metadata = {
  title: 'Distribución de Tareas del Hogar',
  description: 'Aplicación web inteligente para la gestión y distribución eficiente de tareas del hogar.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col text-slate-100 antialiased selection:bg-[var(--c3)] selection:text-white">
        <NotificationProvider>
          <Topbar />
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
            {children}
          </main>
          <Footer />
        </NotificationProvider>
      </body>
    </html>
  );
}
