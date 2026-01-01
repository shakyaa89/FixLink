import {
  Wrench,
  Droplets,
  Zap,
  Hammer,
  Paintbrush,
  TreePine,
  CheckCircle,
  Sparkles,
  ChevronRight,
  Star,
  MessageSquare,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function HomePage() {
  const location = useLocation();

  const { user } = useAuthStore();

  const navigate = useNavigate();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    }
  }, [location]);

  const services = [
    {
      icon: Droplets,
      title: "Plumbing",
      description:
        "Expert plumbing solutions for your home. From repairs to installations.",
      color: "bg-blue-500",
    },
    {
      icon: Zap,
      title: "Electrical",
      description:
        "Safe and reliable electrical services by certified professionals.",
      color: "bg-yellow-500",
    },
    {
      icon: Hammer,
      title: "Carpentry",
      description: "Custom carpentry and woodwork for any renovation project.",
      color: "bg-orange-500",
    },
    {
      icon: Paintbrush,
      title: "Painting",
      description:
        "Interior and exterior painting with premium quality finishes.",
      color: "bg-purple-500",
    },
    {
      icon: TreePine,
      title: "Landscaping",
      description:
        "Transform your outdoor space with professional landscaping.",
      color: "bg-green-500",
    },
    {
      icon: Wrench,
      title: "General Repairs",
      description: "Quick fixes and maintenance for all your home needs.",
      color: "bg-red-500",
    },
  ];

  const features = [
    "Verified & Trusted Professionals",
    "Transparent Pricing",
    "Quick Response Time",
    "24/7 Customer Support",
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section
        id="home"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Service Matching</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Connect With
              <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Verified{" "}
              </span>
              Service Providers
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              Post your service needs, receive competitive offers, and choose
              the best provider. Track progress in real-time with secure
              payments and ratings.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  user == null
                    ? navigate("/auth")
                    : navigate("/user/dashboard");
                }}
                className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <div className="text-3xl font-bold text-gray-900">10K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">5K+</div>
                <div className="text-sm text-gray-600">Verified Providers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">50K+</div>
                <div className="text-sm text-gray-600">Jobs Completed</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-linear-to-br from-blue-600 to-purple-600 rounded-3xl p-8 shadow-2xl">
              <div className="bg-white rounded-2xl p-6 space-y-4">
                {/* Mock Job Card */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      Plumbing Repair
                    </h3>
                    <p className="text-sm text-gray-600">
                      Kitchen sink leaking issue
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 border-2 border-blue-600">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-400 rounded-full"></div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            John's Plumbing
                          </div>
                          <div className="flex items-center space-x-1 text-sm">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-gray-600">4.9 (127)</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">
                          Rs. 800
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-purple-400 rounded-full"></div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            Quick Fix Pro
                          </div>
                          <div className="flex items-center space-x-1 text-sm">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-gray-600">4.7 (89)</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          Rs. 300
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Accept Best Offer
                </button>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-2 bg-white rounded-2xl shadow-xl p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Verified</div>
                <div className="text-sm text-gray-600">100% Safe</div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-2 bg-white rounded-2xl shadow-xl p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">AI Chat</div>
                <div className="text-sm text-gray-600">24/7 Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose FixLink?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <p className="text-gray-900 font-semibold">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive solutions for all your home service needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon as any;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300 p-8 text-center group"
                >
                  <div
                    className={`inline-block p-4 rounded-full ${service.color} mb-4 group-hover:scale-110 transition`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="about" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Post Your Job
              </h3>
              <p className="text-gray-600">
                Describe your service needs with details and photos
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Compare Offers
              </h3>
              <p className="text-gray-600">
                Review proposals from verified providers nearby
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-linear-to-br from-green-600 to-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Get It Done
              </h3>
              <p className="text-gray-600">
                Track progress and pay securely upon completion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="contact"
        className="bg-linear-to-r from-blue-600 to-blue-800 text-white py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Find the perfect professional for your home service needs today
          </p>
          <button className="font-medium rounded-lg duration-300 bg-gray-200 text-gray-900 hover:bg-gray-300 px-8 py-4 text-lg transition hover:scale-105">
            Register Now!
          </button>
        </div>
      </section>
    </div>
  );
}
