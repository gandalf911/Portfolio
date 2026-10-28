import type { Project } from "../content";
import "./ProjectCard.css";

/** Outlined pill (the former "Tag"), now the card's single "See Project" link. */
function SeeProject({ href }: { href: string }) {
  return (
    <a className="tag tag--link bordered" href={href}>
      <span className="t-small c-primary tag__label">See Project</span>
    </a>
  );
}

/** "Project card": a full-bleed picture with the title and a "See Project" link floating at the bottom. */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="project-card">
      <div className="project-card__image">
        <img src={project.image} alt={project.title} draggable={false} style={{ objectPosition: project.position }} />
      </div>
      <div className={`project-card__caption bordered${project.description ? " project-card__caption--desc" : ""}`}>
        {project.description ? (
          <div className="project-card__text">
            <h3 className="t-h4 project-card__title">{project.title}</h3>
            <p className="t-small project-card__desc">{project.description}</p>
          </div>
        ) : (
          <h3 className="t-h4 ta-center project-card__title">{project.title}</h3>
        )}
        <SeeProject href={project.href} />
      </div>
    </div>
  );
}
