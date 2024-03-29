import BlockUserModal from "./BlockUserModal";
import DeletePostModal from "./DeletePostModal";
import ReportPostModal from "./ReportPostModal";
import SharePostModal from "./SharePostModal";
import SigninModal from "./SigninModal";

export default function GlobalModals() {
	return (
		<>
			<SigninModal />
			<BlockUserModal/>
			<ReportPostModal/>
			<DeletePostModal/>
			<SharePostModal/>
		</>
	)
}