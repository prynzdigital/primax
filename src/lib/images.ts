// Centralized image URLs so they can be easily swapped later.
// All sources are public, high-quality cleaning service photography.

export const IMG = {
  hero:
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80',
  heroSecondary:
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80',
  livingRoom:
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80',
  kitchen:
    'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=1200&q=80',
  bathroom:
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80',
  bedroom:
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  office:
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
  empty:
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
  supplies:
    'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=1200&q=80',
  cleanerPortrait:
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=900&q=80',
  aboutTeam:
    'https://images.unsplash.com/photo-1581578017093-cd30fce4eeb7?auto=format&fit=crop&w=1200&q=80',
  aboutDetail:
    'https://images.unsplash.com/photo-1521783988139-89397d761dce?auto=format&fit=crop&w=900&q=80',
  testimonialLiving:
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=80',
};

// Map a service name keyword to a sensible image. Falls back to livingRoom.
export function getServiceImage(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('deep')) return IMG.kitchen;
  if (n.includes('move')) return IMG.empty;
  if (n.includes('office')) return IMG.office;
  if (n.includes('apartment')) return IMG.bedroom;
  if (n.includes('post') || n.includes('renovation')) return IMG.empty;
  if (n.includes('bathroom')) return IMG.bathroom;
  if (n.includes('kitchen')) return IMG.kitchen;
  return IMG.livingRoom;
}
