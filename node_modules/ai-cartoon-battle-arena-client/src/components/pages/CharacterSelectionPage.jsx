import { useMemo, useState } from 'react';
import NavBar from '../common/NavBar';
import SectionHeading from '../common/SectionHeading';
import characters from '../../data/characters';
import { useSound } from '../../context/SoundContext';

const categories = ['All', 'Warrior', 'Tech', 'Beast', 'Mythic', 'Rogue', 'Legend', 'Sci-Fi', 'Mystic'];

function CharacterSelectionPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedId, setSelectedId] = useState(null);
  const { playSound } = useSound();

  const filteredCharacters = useMemo(() => {
    return characters.filter((character) => {
      const searchMatch = character.name.toLowerCase().includes(search.toLowerCase());
      const categoryMatch = category === 'All' || character.category === category;
      return searchMatch && categoryMatch;
    });
  }, [category, search]);

  const selectedCharacter = characters.find((char) => char.id === selectedId);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(248,113,113,0.12),_transparent_25%),_rgb(15,23,42)] text-slate-100">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading title="Characters" description="Choose your cartoon avatar" />
        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-6 rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-700">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Search characters</p>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      playSound('select');
                      setCategory(item);
                    }}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      category === item ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCharacters.map((character) => (
                <button
                  key={character.id}
                  onClick={() => {
                    playSound('jump');
                    setSelectedId(character.id);
                  }}
                  className={`group overflow-hidden rounded-3xl border p-5 text-left transition duration-300 ${
                    selectedId === character.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800 bg-slate-950/70 hover:border-cyan-400/40 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-800 text-3xl transition group-hover:bg-cyan-500/20">
                    {character.avatar}
                  </div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{character.category}</p>
                  <h3 className="mt-3 text-2xl font-semibold text-white">{character.name}</h3>
                  <p className="mt-3 text-slate-400">{character.description}</p>
                </button>
              ))}
            </div>
          </div>

          <aside className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-6 shadow-xl ring-1 ring-slate-700">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Character Preview</p>
            {selectedCharacter ? (
              <div className="mt-6 rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 text-center">
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-cyan-500 text-5xl shadow-lg shadow-cyan-500/20">
                  {selectedCharacter.avatar}
                </div>
                <h3 className="mt-5 text-3xl font-semibold text-white">{selectedCharacter.name}</h3>
                <p className="mt-3 text-slate-400">{selectedCharacter.description}</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <span className="rounded-full bg-slate-800 px-4 py-2 text-sm uppercase tracking-[0.25em] text-slate-400">{selectedCharacter.category}</span>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 text-center text-slate-400">
                Select a character to preview their avatar and details.
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

export default CharacterSelectionPage;
