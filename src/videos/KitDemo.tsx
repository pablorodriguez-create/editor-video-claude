import { AbsoluteFill, Sequence } from "remotion";
import { Background } from "../brand/Background";
import { CalendarioSemana } from "../components/kit/CalendarioSemana";
import { CtaReserva } from "../components/kit/CtaReserva";
import { MomentosClave } from "../components/kit/MomentosClave";
import { LinkedIn3D } from "../components/LinkedIn3D";
import { ProgressBar } from "../components/ProgressBar";

// Muestra del kit de animaciones sobre el fondo de marca (en un vídeo real, debajo va tu cámara).
// Sirve para revisar colores y movimientos antes de usarlos en un vídeo.
export const KIT_DEMO_DURATION = 400;

export const KitDemo: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Sequence durationInFrames={70}>
      <LinkedIn3D dur={70} />
    </Sequence>
    <Sequence from={70} durationInFrames={150}>
      <MomentosClave
        momentos={[
          { from: 0, dur: 45, label: "Estrategia", icon: "estrategia" },
          { from: 50, dur: 45, label: "Clientes", icon: "clientes" },
          { from: 100, dur: 50, label: "Reuniones", icon: "reuniones" },
        ]}
      />
    </Sequence>
    <Sequence from={220} durationInFrames={75}>
      <CalendarioSemana dur={75} />
    </Sequence>
    <Sequence from={300} durationInFrames={100}>
      <CtaReserva dur={100} />
    </Sequence>
    <ProgressBar />
  </AbsoluteFill>
);
