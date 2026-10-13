export interface GenreLanding {
  slug: string;
  name: string;
  labelRw: string;
  descriptionRw: string;
  introRw: string;
}

export const GENRES: GenreLanding[] = [
  {
    slug: 'action',
    name: 'Action',
    labelRw: 'Filime z’Umugambi',
    descriptionRw: 'Reba filime z’umugambi n’imirasire mu Kinyarwanda — ifilime zigize ubushishozi, amagufa n’imirasire ikomeye.',
    introRw: 'Muri iyi mbwoko, ifilime zigira imirasire ikomeye, amagambo y’amashanyarazi n’ibigo by’umugambi. Ni ifilime abakoziye mu Kinyarwanda bifasha umuntu yongera kubona umugambi n’imirasire ikomeye.',
  },
  {
    slug: 'drama',
    name: 'Drama',
    labelRw: 'Ubwiru',
    descriptionRw: 'Ifilime z’ubwiru mu Kinyarwanda zisobanura imyume, imyandikire, n’imirasire y’abantu.',
    introRw: 'Ubwiru ni ubwo busobanura imirire n’imirasire y’abantu mu mitwe y’amagambo. Ifilime z’ubwiru mu Kinyarwanda zigaragaza imyume, imyandikire, n’imirasire y’abantu mu buryo bw’umuntu.',
  },
  {
    slug: 'romance',
    name: 'Romance',
    labelRw: 'Uburyano',
    descriptionRw: 'Reba ifilime z’uburyano mu Kinyarwanda — amagambo y’ubwiza, imirasire y’amahoro, n’imirasire y’abafunzi.',
    introRw: 'Uburyano ni ubwo busobanura imirasire y’amahoro n’imirasire y’abafunzi. Ifilime z’uburyano mu Kinyarwanda zigaragaza imirasire y’amahoro n’imirasire y’abafunzi mu buryo bw’umuntu.',
  },
  {
    slug: 'comedy',
    name: 'Comedy',
    labelRw: 'Ubwishingizi',
    descriptionRw: 'Ifilime zubwishingizi mu Kinyarwanda zigaragaza amakosa, amagambo y’umuti, n’imirasire y’abakozi.',
    introRw: 'Ubwishingizi ni ubwo busobanura imirasire y’amagambo n’imirasire y’abakozi mu Kinyarwanda. Ifilime zubwishingizi zigaragaza amakosa, amagambo y’umuti, n’imirasire y’abakozi.',
  },
  {
    slug: 'sci-fi',
    name: 'Sci-Fi',
    labelRw: 'Filime z’Imibereho',
    descriptionRw: 'Reba filime z’imibereho n’ikoranabuhanga mu Kinyarwanda — amanyaruguru, robots, n’iminsi y’imbere.',
    introRw: 'Filime z’imibereho zerekana imibereho y’imbere n’ikoranabuhanga binyuze mu Kinyarwanda. Ni ifilime zitonderwa ku buryo bushya bw’ikoranabuhanga n’imibereho y’abantu.',
  },
  {
    slug: 'animation',
    name: 'Animation',
    labelRw: 'Filime z’Ubwubatsi',
    descriptionRw: 'Reba filime z’animation mu Kinyarwanda — ifilime z’ubwubatsi zikunzwe n’abana n’abakuru.',
    introRw: 'Filime z’animation mu Kinyarwanda zikoresha ubwubatsi n’imyanda yo kubwira inkuru. Ni ifilime zikunzwe n’abana n’abakuru bose mu Rwanda.',
  },
  {
    slug: 'horror',
    name: 'Horror',
    labelRw: 'Ubwoba',
    descriptionRw: 'Ifilime zubwoba mu Kinyarwanda zigaragaza imirasire y’imirasire, amagambo y’ubwoba, n’imirasire ikomeye.',
    introRw: 'Ubwoba ni ubwo busobanura imirasire y’imirasire n’imirasire ikomeye mu Kinyarwanda. Ifilime zubwoba zigaragaza imirasire y’imirasire n’imirasire ikomeye.',
  },
  {
    slug: 'indian',
    name: 'Indian Films',
    labelRw: 'Filime z’Indiya',
    descriptionRw: 'Reba filime z’Indiya mu Kinyarwanda — amagambo y’imirasire, imirasire y’umugambi, n’imirasire y’abakozi.',
    introRw: 'Filime z’Indiya mu Kinyarwanda zigaragaza imirasire y’umugambi n’imirasire y’abakozi mu Kinyarwanda. Ni ifilime zigize ubushishozi n’imirasire ikomeye mu Kinyarwanda.',
  },
  {
    slug: 'rwandan',
    name: 'Rwandan Films',
    labelRw: 'Filime za Rwanda',
    descriptionRw: 'Reba filime za Rwanda mu Kinyarwanda — imirasire y’abayisobanuzi, amagambo y’umugambi, n’imirasire y’abakozi.',
    introRw: 'Filime za Rwanda mu Kinyarwanda zigaragaza imirasire y’abayisobanuzi n’imirasire y’abakozi mu Kinyarwanda. Ni ifilime zigize ubushishozi n’imirasire ikomeye mu Kinyarwanda.',
  },
  {
    slug: 'series',
    name: 'TV Series',
    labelRw: 'Filime z’ibice',
    descriptionRw: 'Reba ifilime z’ibice mu Kinyarwanda — amagambo y’imirasire, imirasire y’abakozi, n’imirasire ikomeye.',
    introRw: 'Filime z’ibice mu Kinyarwanda zigaragaza imirasire y’abakozi n’imirasire ikomeye mu Kinyarwanda. Ni ifilime zigize ubushishozi n’imirasire ikomeye mu Kinyarwanda.',
  },
];
