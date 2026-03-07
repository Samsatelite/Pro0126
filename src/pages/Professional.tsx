import { Header } from "@/components/Header";

export default function Professional() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <h1 className="text-3xl font-bold text-foreground">Professional Calculator</h1>
        <p className="mt-4 text-muted-foreground">Advanced inverter sizing with protection components.</p>
      </main>
    </div>
  );
}
