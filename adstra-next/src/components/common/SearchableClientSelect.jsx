"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

const SearchableClientSelect = ({ clients, value, onChange, placeholder = "Select Client...", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const selectedClient = clients.find((c) => String(c.id) === String(value));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredClients = clients.filter((c) => {
    const companyName = (c.company_name || "").toLowerCase();
    const contactName = (c.name || "").toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return companyName.includes(searchLower) || contactName.includes(searchLower);
  });

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 flex items-center justify-between p-3 cursor-pointer shadow-sm transition-all hover:border-indigo-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`truncate mr-2 ${selectedClient ? "text-slate-900 font-medium" : "text-slate-400"}`}>
          {selectedClient 
            ? (selectedClient.company_name ? `${selectedClient.company_name} (${selectedClient.name})` : selectedClient.name)
            : placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl animate-in fade-in zoom-in duration-150 origin-top">
          <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50 rounded-t-lg">
            <Search size={14} className="text-slate-400 ml-1" />
            <input
              type="text"
              className="w-full text-sm outline-none bg-transparent py-1.5"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <ul className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <li
                  key={client.id}
                  className={`px-3 py-2.5 rounded-md cursor-pointer flex items-center justify-between text-sm transition-colors mb-0.5 last:mb-0 ${
                    String(value) === String(client.id) ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange({ target: { value: client.id } });
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <span className="truncate">{client.company_name ? `${client.company_name} (${client.name})` : client.name}</span>
                  {String(value) === String(client.id) && <Check size={14} className="text-indigo-600 ml-2 flex-shrink-0" />}
                </li>
              ))
            ) : (
              <li className="px-3 py-6 text-center text-slate-400 text-xs italic">
                No matching clients found
              </li>
            )}
          </ul>
        </div>
      )}
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default SearchableClientSelect;
