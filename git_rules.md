# Git rules
 - Quy tắc tối quan trọng: 
   + Cấm được push thẳng lên develop, phải tạo Merge Request (hay Pull Request) rồi gọi Minh để yêu cầu merge vào branch develop
   + Cấm merge trộm khi chưa có sự cho phép của Minh!

 - Đặt tên branch: tên branch có format như sau: ngữ cảnh/tên người commit/khái quát commit
    + Ngữ cảnh gồm 2 cái: feature (tính năng mới), bugfix (sửa chức năng bị lỗi)
    + Tên người commit: Minh (minhtq hoặc minh), Nam (namnn hoặc nam), Thiệu (thieubv hoặc thieu)
    + Khái quát commit: nói tóm gọn merge request này thêm/sửa tính năng gì
    + Tên branch dài không quá 72 kí tự (check số lượng kí tự ở trang này: https://www.charactercountonline.com/)
    + VD về cách đặt tên branch: 
    VD1: Nam có tạo thêm giao diện đăng nhập trong merge request này
    => Cách đặt tên sẽ là: feature/namnn/create_login_ui

    VD2: Thiệu sửa lại giao diện đang bị lỗi responsive ở trang dashboard
    => Cách đặt tên sẽ là: bugfix/thieubv/enhance_dashboard_responsive

 - Sau khi Minh báo đã merge commit của ai đó, các thành viên trong nhóm chú ý pull code mới nhất từ develop về để tránh conflict hay báo thủ như bạn của Đồng nhóm Nam môn BTL web kì trước
 - Trước khi cắm đầu vào code, hãy nhớ phải pull code từ develop về, rồi tạo nhánh khác để làm
  + Các bước thực hiện:
   . git pull origin develop
   . git checkout -b (tên branch)

 - Sau khi code xong, trước khi commit, kiểm tra xem là mình đang ở branch nào (có thể check mình ở branch nào bằng cách gõ lệnh git branch hoặc xem trên góc dưới cùng bên trái của VS Code), nếu quên chưa checkout, đang ở branch develop, thì cứ dùng lệnh git checkout -b (tên branch) bình thường
 - Kiểm tra lại 1 lượt tất cả các file trước khi commit, đừng code quá vô tri :))
 - Nên add từng file cho cẩn thận, hãy chắc chắn nếu muốn git add .
 - Đặt tên commit cho phép freestyle nhưng phải ngắn gọn, trong tầm khoảng tối đa 20 từ
 - Tạo merge request, trong note (conversation) nếu tạo merge request về UI, gán thêm ảnh để mọi người biết và xem giao diện mình đã code
 - 1 merge request chỉ nên có 1 commit, muốn sửa thành 1 commit như nào có thể liên hệ Minh để nhận chỉ dẫn
