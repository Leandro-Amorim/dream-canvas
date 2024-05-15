import { Cross1Icon, ExternalLinkIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useEffect, useState } from "react";
import { Button } from '../ui/button';

export default function JobAdAlert() {

	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (localStorage && localStorage.getItem('hideJobAd') !== 'true') {
			setVisible(true);
		}
	}, []);


	function hide() {
		localStorage.setItem('hideJobAd', 'true');
		setVisible(false);
	}

	if (!visible) { return []; }

	return (
		<div className="mx-1 mt-1">
			<div className="w-full rounded-md bg-red-500 flex items-center justify-between pl-3 py-[2px]">
				<div className="text-[15px] font-medium">
					<span className="line-clamp-1">
						{`Psst! This developer is looking for work! If you are interested in contacting me, you can reach me through my `}
						<Link href='https://www.linkedin.com/in/leandro-n-amorim/' target="_blank" className="inline-flex items-center font-bold">
							LinkedIn <ExternalLinkIcon className='mx-1' />
						</Link>
					</span>

				</div>
				<Button variant={'link'} size={'icon'} className="size-5 mr-1 !text-white" onClick={hide}><Cross1Icon /></Button>
			</div>
		</div>
	)
}