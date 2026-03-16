import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background ambient-bg">
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="text-center relative z-10 max-w-sm mx-auto px-6">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-3xl font-black tracking-tight mb-2">Zone introuvable</h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Cette salle n'existe pas encore dans ton univers. Retourne au QG pour continuer ta progression.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-6 py-3 hover:bg-amber-500/15 transition-all"
        >
          🏰 Retour au QG
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
