import type { ReactNode } from "react";
import Navbar from "../components/common/Navbar";
import Particles from "../components/reactbits/Particles";
import "./PublicLayout.css";

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="public-layout">
      <div className="public-layout__particles" aria-hidden="true">
        <Particles
          particleColors={["#ffffff"]}
          particleCount={500}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={70}
          moveParticlesOnHover
          particleHoverFactor={0.2}
          alphaParticles={false}
          sizeRandomness={0.35}
          cameraDistance={24}
          disableRotation={false}
          pixelRatio={1}
        />
      </div>
      <div className="public-layout__aurora" aria-hidden="true" />
      <div className="public-layout__frame">
        <Navbar />
        <main className="public-layout__content">{children}</main>
      </div>
    </div>
  );
};

export default PublicLayout;
