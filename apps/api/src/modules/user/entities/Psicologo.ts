import { Replace } from "src/utils/Replace";

interface PsicologoSchema {
  userId: string;
  crp: string;
  crpHash: string | null; 
  bio: string | null;
  schedule_settings: any | null;
}

export class Psicologo {
  private props: PsicologoSchema;

  constructor(props: Replace<PsicologoSchema, { bio?: string | null, schedule_settings?: any | null }>) {
    this.props = {
      ...props,
      bio: props.bio ?? null,
      schedule_settings: props.schedule_settings ?? null,
    }
  }

  get userId(): string { return this.props.userId; }
  
  get crp(): string { return this.props.crp; }
  set crp(crp: string) { this.props.crp = crp; }

  get crpHash(): string | null { return this.props.crpHash; }
  set crpHash(hash: string) { this.props.crpHash = hash; }

  get bio(): string | null { return this.props.bio; }
  set bio(bio: string | null) { this.props.bio = bio; }

  get schedule_settings(): any | null { return this.props.schedule_settings; }
  set schedule_settings(settings: any | null) { this.props.schedule_settings = settings; }
}