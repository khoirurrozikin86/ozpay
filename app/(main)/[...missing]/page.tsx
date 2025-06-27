import { notFound } from "next/navigation";

export default function CatchAllNotFound() {
    notFound(); // akan trigger not-found.tsx dari layout iniis
}
