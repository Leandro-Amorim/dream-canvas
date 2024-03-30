import PostModal from "@/components/explore/PostModal";
import BlockUserModal from "./BlockUserModal";
import DeletePostModal from "./DeletePostModal";
import ReportPostModal from "./ReportPostModal";
import SharePostModal from "./SharePostModal";
import SigninModal from "./SigninModal";

export default function GlobalModals() {
	return (
		<>
			<SigninModal />
			<PostModal />
			<BlockUserModal/>
			<ReportPostModal/>
			<DeletePostModal/>
			<SharePostModal/>
		</>
	)
}