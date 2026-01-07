import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiFileTextBold, PiShieldCheckBold, PiUsersBold, PiClipboardTextBold, PiGitBranchBold, PiBuildingsBold, PiScalesBold, PiFolderBold, PiChartBarBold, PiArrowsClockwiseBold } from "react-icons/pi";
import { HiSearch, HiChevronDown, HiChevronUp, HiCheckCircle } from "react-icons/hi";

// shadcn base Card only
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@radix-ui/react-select";

// Shared Section component
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Card className="shadow-sm rounded-2xl p-5 space-y-3">
            <h5 className="text-lg font-medium">{title}</h5>
            <div className="space-y-3">{children}</div>
        </Card>
    );
}

/** Procurement Policy Viewer (FR) */

type SectionDef = {
    id: string;
    title: string;
    icon: React.ReactNode;
    tags: string[];
    content: React.ReactNode;
};

export default function ProcurementPolicy() {
    const [query, setQuery] = useState("");
    const [openId, setOpenId] = useState<string>("objet-portee");

    const sections: SectionDef[] = useMemo(
        () => [
            {
                id: "objet-portee",
                title: "1. Objet et Portée",
                icon: <PiFileTextBold className="h-5 w-5" />,
                tags: ["gouvernance", "agilité", "contrôle"],
                content: (
                    <Section title="Objectif">
                        <p>
                            Garantir que toutes les activités d’approvisionnement sont menées de manière responsable,
                            économique et via des processus ouverts et concurrentiels.
                        </p>
                        <Section title="Équilibre recherché">
                            <p><strong>Agilité Opérationnelle</strong> — permettre aux équipes d’agir rapidement.</p>
                            <p><strong>Gouvernance & Contrôle</strong> — assurer conformité, discipline financière et éthique.</p>
                        </Section>
                    </Section>
                ),
            },
            {
                id: "principes",
                title: "2. Principes Directeurs",
                icon: <PiShieldCheckBold className="h-5 w-5" />,
                tags: ["transparence", "optimisation", "simplicité", "conformité"],
                content: (
                    <Section title="Principes clés">
                        {["Transparence", "Optimisation des ressources", "Simplicité", "Conformité et intégrité", "Responsabilité", "Évolutivité"].map(
                            (p) => (
                                <div key={p} className="flex gap-2 items-start">
                                    <HiCheckCircle className="mt-1" />
                                    <span>{p}</span>
                                </div>
                            )
                        )}
                    </Section>
                ),
            },
            {
                id: "roles",
                title: "3. Rôles et Responsabilités",
                icon: <PiUsersBold className="h-5 w-5" />,
                tags: ["demande", "approbation", "paiement"],
                content: (
                    <Section title="Responsabilités">
                        <p><strong>Assistant Coordonnateur :</strong> initie les demandes avec justification et coûts.</p>
                        <p><strong>Managers / Coordonnateurs :</strong> examinent et approuvent selon délégation.</p>
                        <p><strong>Finance :</strong> contrôle, initie paiement, maintient séparation des tâches.</p>
                        <p><strong>Direction / COO :</strong> approuve les achats stratégiques ou de grande valeur.</p>
                    </Section>
                ),
            },
            {
                id: "types",
                title: "4. Types de Demandes",
                icon: <PiClipboardTextBold className="h-5 w-5" />,
                tags: ["formulaires"],
                content: (
                    <Section title="Catégories">
                        <ul className="list-disc pl-5">
                            {[
                                "Transport & Logistique",
                                "Achat de Matériel / Fournitures (OPEX)",
                                "Télécommunication",
                                "Moto – Carburant & Maintenance",
                                "CapEx",
                                "Loyer",
                                "Rénovation",
                                "Factures",
                            ].map((t) => (
                                <li key={t}>{t}</li>
                            ))}
                        </ul>
                    </Section>
                ),
            },
            {
                id: "processus",
                title: "5. Processus d’Approbation",
                icon: <PiGitBranchBold className="h-5 w-5" />,
                tags: ["workflow"],
                content: (
                    <Section title="Cycle">
                        <p>Demande → Approbation Régionale → Approbation NYLC → Approbation COO</p>
                        <p>Documents requis : Pro-forma, facture, pièce d’identité selon le cas.</p>
                    </Section>
                ),
            },
            {
                id: "seuils",
                title: "6. Seuils d’Approbation",
                icon: <PiBuildingsBold className="h-5 w-5" />,
                tags: ["seuils"],
                content: (
                    <Section title="Seuils">
                        <p>Les seuils sont définis par la matrice de délégation interne (HT uniquement).</p>
                    </Section>
                ),
            },
            {
                id: "fournisseurs",
                title: "7. Gestion des Fournisseurs",
                icon: <PiScalesBold className="h-5 w-5" />,
                tags: ["fournisseurs"],
                content: (
                    <Section title="Gestion">
                        <p>Sélection basée sur coût, qualité, fiabilité, conformité et valeurs.</p>
                        <p>Revue annuelle des fournisseurs clés et divulgation des conflits d’intérêts.</p>
                    </Section>
                ),
            },
            {
                id: "documentation",
                title: "8. Documentation et Dossiers",
                icon: <PiFolderBold className="h-5 w-5" />,
                tags: ["documentation"],
                content: (
                    <Section title="Rétention">
                        <p>Documentation complète requise. Rétention minimale : 7 ans.</p>
                        <p>Séparation stricte des tâches.</p>
                    </Section>
                ),
            },
            {
                id: "reporting",
                title: "9. Rapports et Surveillance",
                icon: <PiChartBarBold className="h-5 w-5" />,
                tags: ["reporting"],
                content: (
                    <Section title="Rapports">
                        <p>Rapports trimestriels préparés pour le CFO et la Direction.</p>
                    </Section>
                ),
            },
            {
                id: "revision",
                title: "10. Révision de la Politique",
                icon: <PiArrowsClockwiseBold className="h-5 w-5" />,
                tags: ["révision"],
                content: (
                    <Section title="Mise à jour">
                        <p>Révision annuelle ou lors de changements majeurs réglementaires ou opérationnels.</p>
                    </Section>
                ),
            },
        ],
        []
    );

    const filtered = sections.filter((s) =>
        [s.title, ...s.tags].join(" ").toLowerCase().includes(query.toLowerCase())
    );

    const active = sections.find((s) => s.id === openId) ?? sections[0];

    return (
        <div className="mx-auto max-w-5xl p-6 space-y-6">
            <div className="space-y-3">
                <h1 className="text-2xl font-semibold">Politique d’Approvisionnement</h1>
                <div className="relative max-w-md">
                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                        className="pl-9 rounded-2xl"
                        placeholder="Rechercher…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-12 gap-4">
                <Card className="rounded-2xl p-3 md:col-span-4 space-y-2">
                    {filtered.map((s) => (
                        <Button
                            key={s.id}
                            variant={s.id === openId ? "default" : "solid"}
                            className="w-full justify-start gap-3 rounded-2xl"
                            onClick={() => setOpenId(s.id)}
                        >
                            {s.icon}
                            {s.title}
                        </Button>
                    ))}
                </Card>

                <Card className="rounded-2xl p-5 md:col-span-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {active.icon}
                                    <h2 className="text-xl font-medium">{active.title}</h2>
                                </div>
                                <Button
                                    variant="default"
                                    onClick={() => setOpenId("")}
                                    className="rounded-2xl"
                                >
                                    {openId ? <HiChevronUp /> : <HiChevronDown />}
                                </Button>
                            </div>
                            {active.content}
                            <Separator className="my-4" />
                        </motion.div>
                    </AnimatePresence>
                </Card>
            </div>
        </div>
    );
}