import { useRouter } from 'next/router';
import Head from 'next/head';
import Iridescence from "@/components/Iridescence";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <Head>
        <title>PetPet - Your Pet's Digital Home</title>
        <meta name="description" content="Track your pet's activities with blockchain technology" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Iridescence Background + Theme Overlay (match dashboard colors) */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      >
        <Iridescence
          color={[1, 1, 1]} // keep neutral base so overlay defines palette
          mouseReact={true}
          amplitude={0.16}
          speed={0.75}
        />
        {/* Pastel gradient overlay using dashboard palette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            // Base linear gradient from dashboard
            background:
              'linear-gradient(120deg, #FFE3EA 0%, #C9D4FF 100%), ' +
              // Soft blobs using the five dashboard accent colors
              'radial-gradient(40% 50% at 20% 25%, rgba(221,214,254,0.35) 0%, rgba(221,214,254,0) 60%), ' +
              'radial-gradient(40% 50% at 80% 30%, rgba(254,215,170,0.30) 0%, rgba(254,215,170,0) 60%), ' +
              'radial-gradient(45% 55% at 30% 75%, rgba(190,242,234,0.30) 0%, rgba(190,242,234,0) 60%), ' +
              'radial-gradient(45% 55% at 75% 80%, rgba(255,183,197,0.30) 0%, rgba(255,183,197,0) 60%)',
            backgroundBlendMode: 'overlay, normal, normal, normal, normal',
            opacity: 0.85,
          }}
        />
      </div>

      {/* Content Layer */}
      <main 
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6"
        style={{ fontFamily: "'Inter', 'Poppins', 'Helvetica Neue', Arial, sans-serif" }}
      >
        <div className="max-w-4xl w-full text-center space-y-8">
          {/* PetPet Title */}
          <h1 className="text-7xl md:text-9xl font-bold text-[#F85BB4] mb-6 drop-shadow-lg">
            PetPet
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-white max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-md">
            Your pet's digital home on the blockchain. </p>

          {/* Get Started Button */}
          <div className="pt-8">
            <Button
              onClick={handleGetStarted}
              className="px-10 py-7 rounded-2xl bg-[#F85BB4] hover:bg-[#E14CA4] text-white font-bold text-xl shadow-2xl hover:shadow-[#F85BB4]/50 transform hover:scale-105 transition-all duration-300"
              size="lg"
            >
              Get Started
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
