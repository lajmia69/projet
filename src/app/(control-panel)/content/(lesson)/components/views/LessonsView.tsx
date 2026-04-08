'use client';

import _ from 'lodash';
import { ChangeEvent, useEffect, useState, useMemo } from 'react';
import {
    FormControl, MenuItem, Select, TextField, Typography, InputAdornment,
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    CircularProgress, Divider, InputLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'motion/react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

import LessonCard from '../ui/LessonCard';
import { SearchLessons, LessonCreatePayload } from '../../api/types';
import { useLanguages } from '../../api/hooks/languages/useLanguages';
import { useLessonTypes, useModules } from '../../api/hooks/lessons/Lessonmetahooks';
import useUser from '@auth/useUser';
import { useSearchLessons } from '../../api/hooks/lessons/useSearchLessons';
import { useCreateLesson } from '../../api/hooks/lessons/Lessonmutations';

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
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const FADE_START = 20;
const FADE_END = 180;

type CreateLessonForm = {
    name: string;
    description: string;
    language: string;
    lesson_type: string;
    module: string;
};

const emptyForm: CreateLessonForm = {
    name: '',
    description: '',
    language: '',
    lesson_type: '',
    module: '',
};

type FormErrors = Partial<Record<keyof CreateLessonForm, string>>;

function LessonsView() {
    const { data: account } = useUser();

    // ── Data fetching ─────────────────────────────────────────────────────────
    const { data: languages } = useLanguages(account?.id, account?.token?.access);
    const { data: lessonTypes } = useLessonTypes(account?.id, account?.token?.access);
    const { data: modules } = useModules(account?.id, account?.token?.access);

    const searchParams: SearchLessons = { limit: 50, offset: 0 };
    const { data: lessons, isLoading } = useSearchLessons(
        account?.id,
        account?.token?.access,
        searchParams
    );

    const { mutate: createLesson, isPending: isCreating } = useCreateLesson(
        account?.id,
        account?.token?.access
    );

    // ── Filter state ──────────────────────────────────────────────────────────
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState({
        language: 'all',
        subject: 'all',
        trimester: 'all',
        module: 'all'
    });
    const [scrollY, setScrollY] = useState(0);

    // ── Dialog state ──────────────────────────────────────────────────────────
    const [addOpen, setAddOpen] = useState(false);
    const [form, setForm] = useState<CreateLessonForm>(emptyForm);
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    useEffect(() => {
        const onScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const progress = Math.min(1, Math.max(0, (scrollY - FADE_START) / (FADE_END - FADE_START)));
    const heroOpacity = 1 - progress;
    const heroTranslateY = -(progress * 24);

    // ── Filter Logic ──────────────────────────────────────────────────────────
    const filteredData = useMemo(() => {
        if (!lessons?.items) return [];

        return lessons.items.filter((lesson) => {
            const matchesSearch = lesson.name?.toLowerCase().includes(searchText.toLowerCase());
            const matchesLang = filters.language === 'all' || lesson.language?.name === filters.language;
            const matchesModule = filters.module === 'all' || String(lesson.module?.id) === filters.module;

            return matchesSearch && matchesLang && matchesModule;
        });
    }, [lessons, searchText, filters]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleFilterChange = (field: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleOpenAdd = () => {
        setForm(emptyForm);
        setFormErrors({});
        setAddOpen(true);
    };

    const handleCloseAdd = () => {
        if (isCreating) return;
        setAddOpen(false);
    };

    const setField = (field: keyof CreateLessonForm, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const validate = (): boolean => {
        const errors: FormErrors = {};
        if (!form.name.trim()) errors.name = 'Name is required';
        if (!form.language) errors.language = 'Language is required';
        if (!form.lesson_type) errors.lesson_type = 'Lesson type is required';
        if (!form.module) errors.module = 'Module is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitAdd = () => {
        if (!validate()) return;

        const payload: LessonCreatePayload = {
            name: form.name.trim(),
            description: form.description.trim(),
            language_id: Number(form.language),
            lesson_type_id: Number(form.lesson_type),
            module_id: Number(form.module),
            transcription: {},
            tags: [],
        };

        createLesson(payload, { onSuccess: () => setAddOpen(false) });
    };

    if (isLoading) return <FuseLoading />;

    return (
        <>
            <Root
                scroll="page"
                header={
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            overflow: 'hidden',
                            background: 'linear-gradient(160deg, #1c2537 0%, #1e2d45 50%, #192132 100%)',
                            paddingTop: '56px',
                            paddingBottom: '64px',
                            opacity: heroOpacity,
                            transform: `translateY(${heroTranslateY}px)`,
                            pointerEvents: 'none',
                            willChange: 'opacity, transform',
                        }}
                    >
                        {/* Background Decorations */}
                        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(148,163,184,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.045) 1px, transparent 1px)`, backgroundSize: '52px 52px' }} />
                        <div style={{ position: 'absolute', top: '-100px', left: '-120px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,116,139,0.15) 0%, transparent 65%)' }} />

                        <div className="relative flex flex-col items-center justify-center px-6 text-center" style={{ zIndex: 1 }}>
                            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.06, duration: 0.5 } }}>
                                <Typography component="h1" sx={{ fontSize: { xs: '1.85rem', sm: '2.5rem', md: '3.1rem' }, fontWeight: 800, color: '#dde6f0', textShadow: '0 2px 32px rgba(0,0,0,0.45)' }}>
                                    What do you want to learn today?
                                </Typography>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.45 } }} className="mt-4 max-w-lg">
                                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '0.975rem' }, color: 'rgba(148,163,184,0.7)', lineHeight: 1.75 }}>
                                    Browse our lessons — step through real content, one session at a time.
                                </Typography>
                            </motion.div>
                           
                        </div>
                    </div>
                }
                content={
                    <div className="mx-auto flex w-full flex-1 flex-col p-4 pt-6">
                        {/* Filter bar */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="flex w-full flex-wrap items-center gap-2 mb-6">

                            {/* Language Filter */}
                            <FormControl size="small" sx={{ minWidth: 130 }} variant="outlined">
                                <InputLabel>Language</InputLabel>
                                <Select value={filters.language} label="Language" onChange={(e) => handleFilterChange('language', e.target.value)} sx={{ borderRadius: '10px' }}>
                                    <MenuItem value="all"><em>All</em></MenuItem>
                                    {languages?.items.map((lang) => (<MenuItem value={lang.name} key={lang.id}>{lang.name}</MenuItem>))}
                                </Select>
                            </FormControl>

                            {/* Module Filter */}
                            <FormControl size="small" sx={{ minWidth: 130 }} variant="outlined">
                                <InputLabel>Module</InputLabel>
                                <Select value={filters.module} label="Module" onChange={(e) => handleFilterChange('module', e.target.value)} sx={{ borderRadius: '10px' }}>
                                    <MenuItem value="all"><em>All</em></MenuItem>
                                    {modules?.items.map((mod) => (<MenuItem value={String(mod.id)} key={mod.id}>{mod.name}</MenuItem>))}
                                </Select>
                            </FormControl>

                            {/* Search Input */}
                            <TextField
                                size="small"
                                placeholder="Search lessons…"
                                value={searchText}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                                sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                slotProps={{ input: { startAdornment: (<InputAdornment position="start"><FuseSvgIcon size={16} color="disabled">lucide:search</FuseSvgIcon></InputAdornment>) } }}
                            />

                            {filteredData.length > 0 && (
                                <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'text.secondary', ml: 1 }}>
                                    {filteredData.length} result{filteredData.length !== 1 ? 's' : ''}
                                </Typography>
                            )}

                            {/* Add Lesson Button */}
                            <Button
                                onClick={handleOpenAdd}
                                variant="contained"
                                size="small"
                                startIcon={<FuseSvgIcon size={15}>lucide:plus</FuseSvgIcon>}
                                sx={(theme) => ({
                                    ml: 'auto',
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                    boxShadow: theme.palette.mode === 'dark' ? '0 0 14px rgba(59,130,246,0.45)' : '0 0 12px rgba(59,130,246,0.3)',
                                    '&:hover': { background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' },
                                })}
                            >
                                Add Lesson
                            </Button>
                        </motion.div>

                        {/* Card grid */}
                        {filteredData.length > 0 ? (
                            <motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" variants={cardContainer} initial="hidden" animate="show">
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
                                    <Typography color="text.secondary" variant="h6">No lessons found</Typography>
                                    <Typography color="text.disabled" variant="body2">Try adjusting your filters or search terms</Typography>
                                </div>
                            </div>
                        )}
                    </div>
                }
            />

            {/* Add Lesson Dialog */}
            <Dialog open={addOpen} onClose={handleCloseAdd} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '20px' } }}>
                <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <FuseSvgIcon size={20} sx={{ color: '#3b82f6' }}>lucide:book-plus</FuseSvgIcon>
                    New Lesson
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ pt: '24px !important', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        label="Lesson name"
                        value={form.name}
                        onChange={(e) => setField('name', e.target.value)}
                        error={!!formErrors.name}
                        helperText={formErrors.name}
                        fullWidth
                        required
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />

                    <TextField
                        label="Description"
                        value={form.description}
                        onChange={(e) => setField('description', e.target.value)}
                        fullWidth
                        multiline
                        minRows={3}
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />

                    <FormControl size="small" fullWidth required error={!!formErrors.language}>
                        <InputLabel>Language</InputLabel>
                        <Select
                            value={form.language}
                            label="Language"
                            onChange={(e) => setField('language', e.target.value)}
                            sx={{ borderRadius: '10px' }}
                        >
                            {languages?.items.map((lang) => (
                                <MenuItem value={String(lang.id)} key={lang.id}>{lang.name}</MenuItem>
                            ))}
                        </Select>
                        {formErrors.language && <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>{formErrors.language}</Typography>}
                    </FormControl>

                    <div className="flex gap-3">
                        <FormControl size="small" fullWidth required error={!!formErrors.lesson_type}>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={form.lesson_type}
                                label="Type"
                                onChange={(e) => setField('lesson_type', e.target.value)}
                                sx={{ borderRadius: '10px' }}
                            >
                                {lessonTypes?.items.map((type) => (
                                    <MenuItem value={String(type.id)} key={type.id}>{type.name}</MenuItem>
                                ))}
                            </Select>
                            {formErrors.lesson_type && <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>{formErrors.lesson_type}</Typography>}
                        </FormControl>

                        <FormControl size="small" fullWidth required error={!!formErrors.module}>
                            <InputLabel>Module</InputLabel>
                            <Select
                                value={form.module}
                                label="Module"
                                onChange={(e) => setField('module', e.target.value)}
                                sx={{ borderRadius: '10px' }}
                            >
                                {modules?.items.map((mod) => (
                                    <MenuItem value={String(mod.id)} key={mod.id}>
                                        {mod.name} {mod.subject?.name && `— ${mod.subject.name}`}
                                    </MenuItem>
                                ))}
                            </Select>
                            {formErrors.module && <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>{formErrors.module}</Typography>}
                        </FormControl>
                    </div>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button onClick={handleCloseAdd} variant="outlined" disabled={isCreating} sx={{ borderRadius: '10px', textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitAdd}
                        variant="contained"
                        disabled={isCreating}
                        startIcon={isCreating ? <CircularProgress size={14} color="inherit" /> : <FuseSvgIcon size={15}>lucide:check</FuseSvgIcon>}
                        sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}
                    >
                        {isCreating ? 'Creating…' : 'Create Lesson'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default LessonsView;