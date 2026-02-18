'use client';
import _ from 'lodash';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { ChangeEvent, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { InputLabel } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { styled } from '@mui/material/styles';
import FuseLoading from '@fuse/core/FuseLoading';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import LessonCard from '../ui/LessonCard';
import { Lesson, SearchLessons } from '../../api/types';
import { useLanguages } from '@/app/(control-panel)/(platform)/(lesson)/api/hooks/languages/useLanguages';
import useUser from '@auth/useUser';
import { useSearchLessons } from '@/app/(control-panel)/(platform)/(lesson)/api/hooks/lessons/useSearchLessons';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.vars.palette.primary.dark,
		color: theme.palette.getContrastText(theme.palette.primary.main)
	}
}));

const container = {
	show: {
		transition: {
			staggerChildren: 0.04
		}
	}
};

const item = {
	hidden: {
		opacity: 0,
		y: 10
	},
	show: {
		opacity: 1,
		y: 0
	}
};

/**
 * The Courses page.
 */
function LessonsView() {
	const { data: account } = useUser();
	const { data: languages } = useLanguages(account.id, account.token.access);
	const searchLesson: SearchLessons = {
		limit: 10,
		offset: 0
	};

	const { data: lessons, isLoading } = useSearchLessons(account.id, account.token.access, searchLesson);
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	// console.log(lessons);
	const [filteredData, setFilteredData] = useState<Lesson[]>([]);
	const [searchText, setSearchText] = useState('');
	const [selectedLanguage, setSelectedLanguage] = useState('all');
	const [hideCompleted, setHideCompleted] = useState(false);

	useEffect(() => {
		function getFilteredArray() {
			if (lessons.items && searchText.length === 0 && selectedLanguage === 'all' && !hideCompleted) {
				return lessons.items;
			}

			return _.filter(lessons.items, (item) => {
				if (selectedLanguage !== 'all' && item.language.name !== selectedLanguage) {
					return false;
				}

				// if (hideCompleted && item.progress.completed > 0) {
				// 	return false;
				// }

				return item.language.name.toLowerCase().includes(searchText.toLowerCase());
			});
		}

		if (lessons) {
			setFilteredData(getFilteredArray());
		}
	}, [lessons, hideCompleted, searchText, selectedLanguage]);

	function handleSelectedLanguage(event: SelectChangeEvent) {
		setSelectedLanguage(event.target.value);
	}

	function handleSearchText(event: ChangeEvent<HTMLInputElement>) {
		setSearchText(event.target.value);
	}

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<Root
			header={
				<Box className="relative flex shrink-0 items-center justify-center overflow-hidden px-4 py-8 md:p-16">
					<div className="mx-auto flex w-full flex-col items-center justify-center">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1, transition: { delay: 0 } }}
						>
							<PageBreadcrumb
								color="inherit"
								borderColor="inherit"
								className="mb-4"
							/>
						</motion.div>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1, transition: { delay: 0 } }}
						>
							<Typography
								color="inherit"
								className="mt-1 text-center text-4xl font-extrabold tracking-tight sm:text-7xl"
							>
								What do you want to learn today?
							</Typography>
						</motion.div>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1, transition: { delay: 0.3 } }}
						>
							<Typography
								color="inherit"
								className="text-md mt-4 max-w-xl text-center tracking-tight opacity-75 sm:mt-6 sm:text-2xl"
							>
								Our courses will step you through the process of a building small applications, or
								adding new features to existing applications.
							</Typography>
						</motion.div>
					</div>

					<svg
						className="pointer-events-none absolute inset-0"
						viewBox="0 0 960 540"
						width="100%"
						height="100%"
						preserveAspectRatio="xMidYMax slice"
						xmlns="http://www.w3.org/2000/svg"
					>
						<g
							className="opacity-5"
							fill="none"
							stroke="currentColor"
							strokeWidth="100"
						>
							<circle
								r="234"
								cx="196"
								cy="23"
							/>
							<circle
								r="234"
								cx="790"
								cy="491"
							/>
						</g>
					</svg>
				</Box>
			}
			content={
				<div className="mx-auto flex w-full flex-1 flex-col p-4">
					<div className="flex w-full shrink-0 flex-col items-center justify-between gap-2 sm:flex-row sm:gap-0 md:items-center">
						<div className="flex w-full items-center justify-between gap-2 sm:w-auto">
							<FormControl
								className="flex w-full sm:w-34"
								variant="outlined"
							>
								<InputLabel id={'select-language-label'}>Language</InputLabel>
								<Select
									id="category-select"
									labelId={'select-language-label'}
									value={selectedLanguage}
									label={'Language'}
									onChange={handleSelectedLanguage}
								>
									<MenuItem value="all">
										<em> All </em>
									</MenuItem>
									{languages?.items.map((language) => (
										<MenuItem
											value={language.name}
											key={language.id}
										>
											{language.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
							<FormControl
								className="flex w-full sm:w-34"
								variant="outlined"
							>
								<InputLabel id={'select-subject-label'}>Subject</InputLabel>
								<Select
									id="category-select"
									labelId={'select-subject-label'}
									value={selectedLanguage}
									label={'Subject'}
									onChange={handleSelectedLanguage}
								>
									<MenuItem value="all">
										<em> All </em>
									</MenuItem>
									{languages?.items.map((language) => (
										<MenuItem
											value={language.name}
											key={language.id}
										>
											{language.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
							<FormControl
								className="flex w-full sm:w-34"
								variant="outlined"
							>
								<InputLabel id={'select-trimester-label'}>Trimester</InputLabel>
								<Select
									id="category-select"
									labelId={'select-trimester-label'}
									value={selectedLanguage}
									label={'Trimester'}
									onChange={handleSelectedLanguage}
								>
									<MenuItem value="all">
										<em> All </em>
									</MenuItem>
									{languages?.items.map((language) => (
										<MenuItem
											value={language.name}
											key={language.id}
										>
											{language.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
							<FormControl
								className="flex w-full sm:w-34"
								variant="outlined"
							>
								<InputLabel id={'select-module-label'}>Module</InputLabel>
								<Select
									id="category-select"
									labelId={'select-module-label'}
									value={selectedLanguage}
									label={'Module'}
									onChange={handleSelectedLanguage}
								>
									<MenuItem value="all">
										<em> All </em>
									</MenuItem>
									{languages?.items.map((language) => (
										<MenuItem
											value={language.name}
											key={language.id}
										>
											{language.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
							<FormControl className="flex w-full sm:w-34">
								<TextField
									id="search"
									placeholder="Enter a keyword..."
									className="flex w-full sm:w-64"
									value={searchText}
									slotProps={{
										input: {
											'aria-label': 'Search'
										}
									}}
									onChange={handleSearchText}
								/>
							</FormControl>
						</div>
						{/*<div className="flex w-full items-center gap-2 sm:w-auto">*/}
						{/*	<FormControlLabel*/}
						{/*		className="m-0"*/}
						{/*		label="Hide completed"*/}
						{/*		control={*/}
						{/*			<Switch*/}
						{/*				onChange={(ev) => {*/}
						{/*					setHideCompleted(ev.target.checked);*/}
						{/*				}}*/}
						{/*				checked={hideCompleted}*/}
						{/*				name="hideCompleted"*/}
						{/*			/>*/}
						{/*		}*/}
						{/*	/>*/}
						{/*</div>*/}
					</div>
					{filteredData &&
						(filteredData.length > 0 ? (
							<motion.div
								className="mt-3 grid grid-cols-2 gap-4 sm:mt-4 sm:grid-cols-3 lg:grid-cols-4"
								variants={container}
								initial="hidden"
								animate="show"
							>
								{filteredData.map((lesson) => {
									return (
										<motion.div
											variants={item}
											key={lesson.id}
										>
											<LessonCard lesson={lesson} />
										</motion.div>
									);
								})}
							</motion.div>
						) : (
							<div className="flex flex-1 items-center justify-center">
								<Typography
									color="text.secondary"
									className="my-6 text-3xl"
								>
									No courses found!
								</Typography>
							</div>
						))}
				</div>
			}
			scroll={isMobile ? 'page' : 'content'}
		/>
	);
}

export default LessonsView;
