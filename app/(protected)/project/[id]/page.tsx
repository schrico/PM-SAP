"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Project } from "@/types/project";

export default function ProjectDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createClientComponentClient({ supabaseUrl, supabaseKey });

  const {
    data: project,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["project", id],
    queryFn: async (): Promise<Project> => {
      if (!id) throw new Error("Project ID is required");

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch project: ${error.message}`);
      }

      return data;
    },
    enabled: !!id,
  });

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );

  if (error || !project)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <p className="text-lg text-muted-foreground mb-4">
          {error ? "Erro ao carregar projeto." : "Projeto não encontrado."}
        </p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition"
        >
          Voltar
        </button>
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header simplificado */}
      <header className="sticky top-20 sm:top-24 md:top-28 lg:top-32 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <h1 className="text-xl font-semibold text-gray-800 truncate">
            {project.name}
          </h1>
          <div className="w-12" /> {/* espaço vazio p/ balancear layout */}
        </div>
      </header>

      {/* Conteúdo */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Sistema</h2>
              <p className="text-lg font-semibold">{project.system}</p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500">Prazo</h2>
              <p className="text-lg font-semibold">
                {new Date(project.final_deadline ?? "").toLocaleDateString("pt-PT", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500">
                Língua de origem
              </h2>
              <p className="text-lg font-semibold">{project.language_in}</p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500">
                Língua de destino
              </h2>
              <p className="text-lg font-semibold">{project.language_out}</p>
            </div>

            {project.words && (
              <div>
                <h2 className="text-sm font-medium text-gray-500">Palavras</h2>
                <p className="text-lg font-semibold">{project.words}</p>
              </div>
            )}

            {project.lines && (
              <div>
                <h2 className="text-sm font-medium text-gray-500">Linhas</h2>
                <p className="text-lg font-semibold">{project.lines}</p>
              </div>
            )}

            <div>
              <h2 className="text-sm font-medium text-gray-500">Status</h2>
              <p
                className={`inline-flex items-center px-3 py-1 text-sm rounded-full ${
                  project.status === "active"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {project.status === "active" ? "Ativo" : "Concluído"}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500">Financeiro</h2>
              <p className="text-lg font-semibold">
                {project.paid ? "Paid" : "Pending"}
                {" / "}
                {project.invoiced ? "Invoiced" : "Not invoiced"}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-medium text-gray-500 mb-2">
              Instruções
            </h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {project.instructions || "Sem descrição fornecida."}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
