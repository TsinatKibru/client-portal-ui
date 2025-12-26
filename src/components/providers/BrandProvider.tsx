"use client";

import { useEffect, useState, createContext, useContext } from "react";
import api from "@/lib/api";

const BrandContext = createContext({ brandColor: "#4f46e5" });

export function BrandProvider({ children }: { children: React.ReactNode }) {
    const [brandColor, setBrandColor] = useState("#4f46e5");

    useEffect(() => {
        const fetchBrand = async () => {
            try {
                const res = await api.get("/business/profile");
                if (res.data.brandColor) {
                    setBrandColor(res.data.brandColor);
                    document.documentElement.style.setProperty('--brand-primary', res.data.brandColor);
                    // Generate a "shadow" or "soft" version for hover/bg
                    document.documentElement.style.setProperty('--brand-soft', `${res.data.brandColor}15`); // 15 is ~8% opacity hex
                }
            } catch (err) {
                // If not logged in or error, keep default
            }
        };
        fetchBrand();
    }, []);

    return (
        <BrandContext.Provider value={{ brandColor }}>
            {children}
        </BrandContext.Provider>
    );
}

export const useBrand = () => useContext(BrandContext);
