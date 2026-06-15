'use client';

import Link from 'next/link';
import { useSession } from '@/components/auth/SessionProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { user } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-gradient">
            ArtistConnect
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/search" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Discover
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <SearchBar />
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<button className="relative h-9 w-9 rounded-full inline-flex items-center justify-center gap-2 transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50 hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50" />}>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.image || ''} />
                  <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/artists/${user.id}`}>My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/upload">Upload</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/messages">Messages</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/api/auth?action=logout">Sign Out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
