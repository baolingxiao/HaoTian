"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/avatar-chat", label: "🎭 Avatar 聊天", icon: "🎭" },
    { href: "/finance", label: "📈 财经新闻", icon: "📈" },
    { href: "/voice", label: "🎤 语音聊天", icon: "🎤" },
    { href: "/memory-demo", label: "🧠 本地记忆", icon: "🧠" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <Link 
              href="/avatar-chat" 
              className="flex items-center px-2 text-xl font-bold text-purple-600 hover:text-purple-700"
            >
              🤖 AI Chatpot
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}


