import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-(--text) border-t border-(--border) bg-(--primary)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold ">FixLink</span>
            </div>
            <p className="text-sm">
              Your trusted platform for quality home services. Connect with
              verified professionals.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className=" font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>Plumbing</li>
              <li>Electrical</li>
              <li>Carpentry</li>
              <li>Painting</li>
              <li>Landscaping</li>
              <li>General Repairs</li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className=" font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm ">
              <li>
                <a href="#" className="hover:text-(--accent) transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-(--accent) transition">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-(--accent) transition">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-(--accent) transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className=" font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-(--accent) transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-(--accent) transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-(--accent) transition">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links and Copyright */}
        <div className="border-t border-(--border) pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex gap-6 mb-4 md:mb-0">
            <a href="#" className="hover:text-(--accent) transition">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-(--accent) transition">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-(--accent) transition">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-(--accent) transition">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
          <p className="text-sm text-center md:text-right">
            &copy; {currentYear} FixLink. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
