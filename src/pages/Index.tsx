import { Header } from "@/components/Header";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <h1 className="text-3xl font-bold text-foreground">Inverter Sizing Calculator</h1>
        <p className="mt-4 text-muted-foreground">Calculate your solar inverter requirements.</p>
      </main>
    </div>
  );
}
