import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import PageBreadcrumb from 'src/components/PageBreadcrumb';

/**
 * The products header.
 */
function RolesHeader() {
  return (
    <div className="flex flex-auto flex-col py-4" style={{ background: 'linear-gradient(135deg, #1A2E38 0%, #2D8B7C 100%)', color: '#fff' }}>
      <PageBreadcrumb className="mb-2" />
                    <div className="flex min-w-0 flex-auto flex-col gap-2 sm:flex-row sm:items-center">
				<div className="flex flex-auto items-center gap-2">
					<motion.span
						initial={{ x: -20 }}
						animate={{ x: 0, transition: { delay: 0.2 } }}
					>
						<Typography className="text-4xl leading-none font-extrabold tracking-tight">
							Roles
						</Typography>
					</motion.span>

					<div className="flex flex-1 items-center justify-end gap-2">
                        <motion.div
                            className="flex grow-0"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
                        >
                            <Button
                                variant="contained"
                                component={NavLinkAdapter}
                                to="/administration/roles/new"
                                startIcon={<FuseSvgIcon>lucide:plus</FuseSvgIcon>}
                                sx={{
                                    background: 'linear-gradient(135deg, #1A2E38, #2D8B7C)',
                                    color: '#E8E4DA',
                                    fontWeight: 700,
                                    '&:hover': { background: 'linear-gradient(135deg, #2D8B7C, #1A2E38)' }
                                }}
                            >
                                Add
                            </Button>
                        </motion.div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default RolesHeader;
