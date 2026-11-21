"use client";

import { useFavorites } from "@/components/favorites/FavoritesProvider";
import { HeartIcon } from "@/components/ui/icons";

type FavoriteButtonProps = {
  slug: string;
  name: string;
  variant?: "icon" | "text";
  className?: string;
};

export function FavoriteButton({
  slug,
  name,
  variant = "icon",
  className = "",
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(slug);
  const label = saved
    ? `Remove ${name} from favorites`
    : `Save ${name} to favorites`;

  if (variant === "text") {
    return (
      <button
        type="button"
        onClick={() => toggleFavorite(slug)}
        aria-pressed={saved}
        aria-label={label}
        className={`btn min-h-10 px-4 ${
          saved
            ? "border-primary/30 bg-primary-fixed/40 text-primary"
            : "btn-outline"
        } ${className}`}
      >
        <HeartIcon size={16} filled={saved} />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(slug)}
      aria-pressed={saved}
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-surface-container-lowest/90 text-on-surface-variant shadow-sm backdrop-blur transition-colors hover:text-primary ${
        saved ? "text-primary" : ""
      } ${className}`}
    >
      <HeartIcon size={17} filled={saved} />
    </button>
  );
}
