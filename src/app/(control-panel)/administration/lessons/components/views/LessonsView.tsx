'use client';

import { ChangeEvent, useEffect, useState, useMemo } from 'react';
import {
    FormControl,
    MenuItem,
    Select,
    TextField,
    Typography,
    InputAdornment,
    InputLabel,
    SelectChangeEvent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'motion/react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

import LessonCard from '../ui/LessonCard';
import { SearchLessons } from '../../../../content/(lesson)/api/types';
import { useLanguages } from '../../../../content/(lesson)/api/hooks/languages/useLanguages';
import { useModules } from '../../../../content/(lesson)/api/hooks/lessons/Lessonmetahooks';
import { useSearchLessons } from '../../../../content/(lesson)/api/hooks/lessons/useSearchLessons';
import useUser from '@auth/useUser';

const Root = styled(FusePageSimple)(() => ({
    '& .FusePageSimple-header': {
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        padding: 0,
    },
    '& .FusePageSimple-contentWrapper': { overflow: 'visible !important' },
    '& .FusePageSimple-content': { overflow: 'visible !important' },
    '& .FusePageSimple-rootWrapper': { overflow: 'visible !important' },
}));

const cardContainer = { show: { transition: { staggerChildren: 0.05 } } };
const cardItem = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
};

function LessonsView() {
    const { data: account, isLoading: isUserLoading } = useUser();
    
    // State
    const [searchText, setSearchText] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedModule, setSelectedModule] = useState('');

    // --- Dynamic ID Calculation ---
    const accountId = useMemo(() => (account?.id ? String(account.id) : ''), [account]);
    const accessToken = account?.token?.access || '';

    // Log for verification - check your console to confirm this is NOT 18
useEffect(() => {
    if (!accessToken) {
        console.error("DEBUG: Access Token is missing!");
    }
}, [accessToken]);

    const searchParams: SearchLessons = useMemo(() => ({
        limit: 50,
        offset: 0,
        ...(selectedLanguage && { language: selectedLanguage }),
    }), [selectedLanguage]);

    // Data Hooks
    const { 
    data: modules, 
    isLoading: isModulesLoading, 
    error: modulesError 
} = useModules(accountId, accessToken);

useEffect(() => {
    if (modulesError) {
        console.error("Modules API failed:", modulesError);
    }
}, [modulesError]);
    const { data: languages } = useLanguages(accountId, accessToken);
    const { data: lessons, isLoading: isLessonsLoading } = useSearchLessons(
        accountId,
        accessToken,
        searchParams
    );

    // Handlers
    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };

    const handleLanguageChange = (event: SelectChangeEvent) => {
        setSelectedLanguage(event.target.value);
    };

    const handleModuleChange = (event: SelectChangeEvent) => {
        setSelectedModule(event.target.value);
    };

    if (isUserLoading || isLessonsLoading) {
        return <FuseLoading />;
    }

    if (!account) {
        return (
            <div className="flex h-full items-center justify-center">
                <Typography>Please log in to view lessons.</Typography>
            </div>
        );
    }

    const filteredData = lessons?.items?.filter((lesson) => {
        const matchesSearch = lesson.name.toLowerCase().includes(searchText.toLowerCase());
        const matchesModule = selectedModule ? String(lesson.module.id) === selectedModule : true;
        return matchesSearch && matchesModule;
    }) || [];

    return (
        <Root
            header={
                <div className="flex flex-col gap-4 p-8">
                    <Typography variant="h4">My Lessons</Typography>
                </div>
            }
            content={
                <div className="p-8">
                    {/* Filters & Search */}
                    <motion.div className="mb-8 flex flex-wrap items-center gap-4">
                        <TextField
                            placeholder="Search lessons..."
                            value={searchText}
                            onChange={handleSearchChange}
                            sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            slotProps={{ 
                                input: { 
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FuseSvgIcon size={16} color="disabled">lucide:search</FuseSvgIcon>
                                        </InputAdornment>
                                    ) 
                                } 
                            }}
                        />

                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Language</InputLabel>
                            <Select value={selectedLanguage} label="Language" onChange={handleLanguageChange}>
                                <MenuItem value="">All</MenuItem>
                               {languages?.items?.map((lang) => (
    <MenuItem key={lang.id} value={lang.id}>{lang.name}</MenuItem>
                                    ))}
                            </Select>
                        </FormControl>

                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Module</InputLabel>
                            <Select value={selectedModule} label="Module" onChange={handleModuleChange}>
                                <MenuItem value="">All</MenuItem>
                                {modules?.items?.map((mod) => (
    <MenuItem key={mod.id} value={mod.id}>{mod.name}</MenuItem>
))}
                            </Select>
                        </FormControl>

                        {filteredData.length > 0 && (
                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'text.secondary', ml: 1 }}>
                                {filteredData.length} result{filteredData.length !== 1 ? 's' : ''}
                            </Typography>
                        )}
                    </motion.div>

                    {/* Content Grid */}
                    {filteredData.length > 0 ? (
                        <motion.div 
                            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                            variants={cardContainer} 
                            initial="hidden" 
                            animate="show"
                        >
                            {filteredData.map((lesson) => (
                                <motion.div variants={cardItem} key={lesson.id}>
                                    <LessonCard lesson={lesson} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="flex flex-1 items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-3">
                                <FuseSvgIcon size={48} sx={{ color: 'text.disabled' }}>lucide:search-x</FuseSvgIcon>
                                <Typography color="text.secondary">No lessons found matching your filters.</Typography>
                            </div>
                        </div>
                    )}
                </div>
            }
        />
    );
}

export default LessonsView;