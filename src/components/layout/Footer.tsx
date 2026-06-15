import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">ArtistConnect</span>
        </div>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/search" className="hover:text-foreground transition-colors">Discover</Link>
          <Link href="/auth/register" className="hover:text-foreground transition-colors">Join</Link>
        </nav>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ArtistConnect. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
