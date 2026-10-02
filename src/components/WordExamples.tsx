import type { TeluguWordExample } from '../data/teluguWordExamples'

type WordExamplesProps = {
  words: TeluguWordExample[]
}

export function WordExamples({ words }: WordExamplesProps) {
  return (
    <section className="word-examples" aria-labelledby="word-examples-title">
      <div className="word-examples-heading">
        <div>
          <p className="eyebrow">Look and remember</p>
          <h2 id="word-examples-title">Words that start with {words[0]?.title.charAt(0)}</h2>
        </div>
        <span className="word-examples-script">అ · a</span>
      </div>
      <div className="word-example-grid">
        {words.map((word) => (
          <article className="word-example-card" key={word.title}>
            <div className="word-example-image" role="img" aria-label={word.imageLabel}>
              <span aria-hidden="true">{word.emoji}</span>
            </div>
            <h3>{word.title}</h3>
            <p>{word.meaning}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
