import { Header } from "@/components/Header";
import { Shield, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function Professional() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Cpu className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            Professional Calculator
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Advanced inverter sizing with full protection component specifications.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto"
        >
          {[
            {
              icon: <Shield className="w-6 h-6 text-primary" />,
              title: "Circuit Protection",
              desc: "DC and AC breaker sizing for every segment from panels to load.",
            },
            {
              icon: <Cpu className="w-6 h-6 text-solar" />,
              title: "Cable Specifications",
              desc: "Correct cable sizes for panel, battery, inverter, and load runs.",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-muted mb-4">
                {card.icon}
              </div>
              <h3 className="font-semibold text-card-foreground">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
