export type MissionQuestion = {
	question: string;
	answer: string;
	withSignupLinks?: boolean;
};

export const MISSION_QUESTIONS: MissionQuestion[] = [
	{
		question: 'What is Match?',
		answer:
			'A place to post one concrete need — cleanup, groceries, repairs, a lift — so a volunteer nearby can pick it up. Every task has a spot on the map, so nothing gets lost in a group chat.'
	},
	{
		question: 'Why did you build it?',
		answer:
			"After the floods, many people wanted to help and many needed it, but they couldn't find each other. Help went where the cameras were. We wanted it to reach every street."
	},
	{
		question: 'Who is behind it?',
		answer:
			'A small team of volunteers and developers from Valencia. Match is not a company and has no ads.'
	},
	{
		question: 'How does it help?',
		answer:
			'You post a task. A volunteer nearby offers to help. You accept, agree on the details, and mark it done. Small tasks, finished, add up.'
	},
	{
		question: 'Is it free?',
		answer:
			'Yes, for everyone, always. Volunteers are never paid through Match and help seekers never pay.'
	},
	{
		question: 'How can I get involved?',
		answer:
			'Sign up as a volunteer and pick a task near you. If you need help, sign up and post your first task.',
		withSignupLinks: true
	}
];
