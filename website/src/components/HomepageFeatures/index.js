import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Seamless Integration Across Knowledge Graphs, Bridging Data Silos',
    Svg: "https://mdn.alipayobjects.com/huamei_xgb3qj/afts/img/A*88JoRLde504AAAAAAAAAAAAADtmcAQ/original",
    description: (
      <>
          By employing a standardized semantic framework, it becomes feasible to connect diverse, heterogeneous, sequential and intricately related data sources within an enterprise, thereby dismantling data silos
      </>
    ),
  },
  {
    title: 'Deep Semantic Contextual Association',
    Svg: "https://mdn.alipayobjects.com/huamei_xgb3qj/afts/img/A*9walTIIM8PsAAAAAAAAAAAAADtmcAQ/original",
    description: (
      <>
          By standardizing semantic enrichment of business entity properties, data can be managed knowledge-based, thereby enriching semantic associations among entities and further improving business efficiency
      </>
    ),
  },
  {
    title: 'Knowledge Symbolic Representation, Bidirectionally Driven by Large Models',
    Svg: "https://mdn.alipayobjects.com/huamei_xgb3qj/afts/img/A*wsR8R7o7ysgAAAAAAAAAAAAADtmcAQ/original",
    description: (
      <>
          Leveraging a programmable knowledge graph framework makes it easy to combine domain knowledge graphs with large language models(LLM), thereby enhancing the controllability of LLMs in practical applications.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={Svg} className={styles.featureSvg} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
