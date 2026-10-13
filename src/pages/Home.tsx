import { useRef } from 'react';
import { animate, stagger } from 'animejs';
import { SITE } from '@/data/site';
import { DEFAULT_COMBINATION, sanitizeCombination } from '@/data/frames/catalog';
import { CATEGORY_LABEL, CATEGORY_ORDER } from '@/data/frames/standard';
import { useUi } from '@/store/ui';
import { useIntro } from '@/hooks/useIntro';
import { reducedMotion } from '@/lib/motion';
import KineticTitle from '@/components/ui/KineticTitle';
import MagneticButton from '@/components/ui/MagneticButton';
import ScrambleText from '@/components/ui/ScrambleText';
import { useTransitionNav } from '@/components/layout/PageTransition';
import HomeScene, { useCyclingCombination } from '@/three/HomeScene';
import './Home.css';

const INITIAL = sanitizeCombination(DEFAULT_COMBINATION);

export default function Home() {
  const booted = useUi((s) => s.booted);
  const { go } = useTransitionNav();
  const combo = useCyclingCombination(INITIAL, booted);
  const foot = useRef<HTMLDivElement>(null);

  useIntro(() => {
    const items = foot.current?.querySelectorAll('.home-reveal');
    if (!items) return;
    if (reducedMotion()) {
      items.forEach((i) => ((i as HTMLElement).style.transform = 'none'));
      return;
    }
    animate(items, {
      translateY: ['110%', '0%'],
      duration: 1200,
      delay: stagger(90, { start: 650 }),
      ease: 'outExpo',
    });
  });

  return (
    <div className="home">
      <div className="home-scene" data-cursor-hide>
        <HomeScene combination={combo} started={booted} />
      </div>

      <KineticTitle
        className="home-title"
        label={SITE.brand}
        lines={[
          { text: 'Battle', className: 'home-title-l1' },
          { text: 'Bots', className: 'home-title-l2' },
        ]}
        radius={280}
        stretch={[104, 125]}
        weight={[780, 900]}
        delay={120}
      />

      <div className="home-foot page-pad" ref={foot}>
        <p className="home-sign">
          <span className="mask-line">
            <span className="mask-inner home-reveal">{SITE.signature}</span>
          </span>
        </p>

        <ul className="home-combo" aria-label="Combinação exibida">
          {CATEGORY_ORDER.map((cat) => (
            <li key={cat} className="mask-line">
              <span className="mask-inner home-reveal">
                <span className="home-combo-cat">{CATEGORY_LABEL[cat]}</span>
                <ScrambleText className="home-combo-id" text={combo[cat]} />
              </span>
            </li>
          ))}
        </ul>

        <div className="mask-line home-cta-wrap">
          <span className="mask-inner home-reveal">
            <MagneticButton className="btn btn--primary home-cta" onClick={() => go('/montar')}>
              Montar robô
            </MagneticButton>
          </span>
        </div>
      </div>
    </div>
  );
}
