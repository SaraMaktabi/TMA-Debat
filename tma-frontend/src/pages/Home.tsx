import { Link } from "react-router-dom";
import { ArrowRight, Bot, Zap, Shield, BarChart3, Wrench, UserCheck } from "lucide-react";

export default function Home() {
  const features = [
    { icon: Bot, title: "Multi-Agent AI", description: "Intelligent ticket analysis by specialized AI agents" },
    { icon: Zap, title: "Instant Resolution", description: "Automated incident triage and solution proposals" },
    { icon: Shield, title: "Enterprise Ready", description: "Secure, scalable incident management" },
    { icon: BarChart3, title: "Analytics", description: "Real-time insights and performance metrics" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-white">
     <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-blue-900" />
            <span className="font-semibold text-xl text-gray-900">TMA System</span>
          </div>
          <Link
            to="/tickets"
            className="px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </nav>

     <div className="max-w-7xl mx-auto px-6 py-28 lg:py-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-900 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            AI-Powered Incident Management
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Intelligent IT Support with Multi-Agent AI
          </h1>
          
          <div></div>

          <p className="text-lg lg:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Revolutionize incident management with our AI-powered system. Three specialized agents collaborate to analyze, solve, and manage IT incidents automatically.
          </p>

         <div className="flex items-center justify-center gap-4 flex-wrap mt-6">
            <Link
              to="/tickets"
              className="px-8 py-4 bg-blue-900 text-white rounded-xl font-medium hover:bg-blue-950 transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/30"
            >
              Go to Tickets
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-blue-900" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

       <div className="bg-white rounded-3xl p-10 lg:p-14 border border-gray-200 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">How It Works</h2>
          <p className="text-center text-gray-600 mb-10">Three specialized AI agents collaborate to resolve incidents automatically</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-lg font-bold text-blue-900">1</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Analyst Agent</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Analyzes incident details, identifies patterns, and determines root causes using advanced diagnostics</p>
            </div>
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform">
                  <Wrench className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-lg font-bold text-green-600">2</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Technician Agent</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Proposes technical solutions, creates action plans, and provides implementation guidance</p>
            </div>
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform">
                  <UserCheck className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-lg font-bold text-purple-600">3</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Manager Agent</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Reviews proposals, makes final decisions, and allocates resources for optimal resolution</p>
            </div>
          </div>
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full">
              <Zap className="w-5 h-5 text-blue-900" />
              <span className="font-semibold text-gray-900">Average resolution time: 8 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}