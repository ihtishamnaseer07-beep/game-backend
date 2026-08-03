function SectionHeading({ title, description }) {
  return (
    <div className="mb-6">
      <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">{title}</p>
      <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{description}</h2>
    </div>
  );
}

export default SectionHeading;
