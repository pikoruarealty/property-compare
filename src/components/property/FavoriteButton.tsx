import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useFavoritesStore } from "@/stores/favorites-store";
import { useHydrated } from "@/hooks/use-hydrated";

interface Props {
  propertyId: string;
  propertyName: string;
  className?: string;
}

export function FavoriteButton({ propertyId, propertyName, className = "" }: Props) {
  const hydrated = useHydrated();
  const { isFavorite, toggle } = useFavoritesStore();
  const favorited = hydrated && isFavorite(propertyId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowFav = toggle(propertyId);
    toast.success(
      nowFav ? `${propertyName} saved to favorites` : `${propertyName} removed from favorites`,
    );
  };

  return (
    <button
      type="button"
      aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
      onClick={handleClick}
      className={`grid h-9 w-9 place-items-center rounded-full border backdrop-blur-md transition-all duration-300 ${
        favorited
          ? "border-champagne bg-champagne text-lux-black"
          : "border-champagne/40 bg-lux-black/40 text-champagne hover:bg-lux-black/60"
      } ${className}`}
    >
      <Heart className={`h-4 w-4 ${favorited ? "fill-current" : ""}`} />
    </button>
  );
}
