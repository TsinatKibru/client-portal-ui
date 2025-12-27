import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export const useBusinessProfile = () => {
    return useQuery({
        queryKey: ["business-profile"],
        queryFn: async () => {
            const res = await api.get("/business/profile");
            return res.data;
        },
    });
};

export const useInvoices = () => {
    return useQuery({
        queryKey: ["invoices"],
        queryFn: async () => {
            const res = await api.get("/invoices");
            return res.data;
        },
    });
};

export const useProjects = () => {
    return useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const res = await api.get("/projects");
            return res.data;
        },
    });
};

export const useClients = () => {
    return useQuery({
        queryKey: ["clients"],
        queryFn: async () => {
            const res = await api.get("/clients");
            return res.data;
        },
    });
};

export const usePortalProjects = () => {
    return useQuery({
        queryKey: ["portal-projects"],
        queryFn: async () => {
            const res = await api.get("/portal/projects");
            return res.data;
        },
    });
};

export const usePortalInvoices = () => {
    return useQuery({
        queryKey: ["portal-invoices"],
        queryFn: async () => {
            const res = await api.get("/portal/invoices");
            return res.data;
        },
    });
};
