import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  MessageSquareText, 
  BarChart3, 
  Sparkles, 
  Upload,
  TrendingUp,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";

const features = [
  {
    icon: Upload,
    title: "Batch Processing",
    description: "Upload CSV or Excel files with hundreds of reviews for instant analysis"
  },
  {
    icon: Sparkles,
    title: "Aspect Extraction",
    description: "Identify specific aspects like 'battery life' or 'customer service' from reviews"
  },
  {
    icon: BarChart3,
    title: "Sentiment Analysis",
    description: "Classify sentiments with confidence scores for each extracted aspect"
  },
  {
    icon: TrendingUp,
    title: "Active Learning",
    description: "Improve accuracy over time by correcting low-confidence predictions"
  }
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] opacity-30 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm shadow-soft">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground">Aspect-Based Sentiment Analysis</span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Understand what your{" "}
                <span className="text-primary">customers</span>{" "}
                really think
              </h1>

              {/* Subtitle */}
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
                Extract meaningful insights from customer reviews with AI-powered aspect-based sentiment analysis. 
                Identify trends, improve products, and make data-driven decisions.
              </p>

              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
              >
                <Link to="/signup">
                  <Button size="lg" className="gap-2 shadow-soft hover:shadow-elevated">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border bg-muted/30 px-4 py-20 sm:px-6">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Everything you need to analyze feedback
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Powerful tools to process, understand, and act on customer reviews at scale.
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="group relative rounded-xl border border-border bg-card p-6 shadow-soft hover:shadow-elevated transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{feature.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="px-4 py-16 sm:px-6">
          <div className="container mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center justify-center gap-3 text-muted-foreground"
            >
              <Shield className="h-5 w-5" />
              <span className="text-sm">
                Secure, private, and built with modern best practices
              </span>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 sm:px-6">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4" />
            <span>ReviewSense</span>
          </div>
          <p>© 2024 ReviewSense. Built for better feedback analysis.</p>
        </div>
      </footer>
    </div>
  );
}
