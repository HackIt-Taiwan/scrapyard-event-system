import {
  ClipboardDocumentCheckIcon,
  CakeIcon,
} from '@heroicons/react/24/outline';

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isAuth,
  userRoles,
}) => {
  const generateNavigation = (isAuth: boolean, userRoles: string[]) => {
    const navigation = [
      // ... existing navigation items ...
    ];

    if (isAuth && userRoles.includes('staff')) {
      navigation.push(
        // ... existing staff navigation items ...
        {
          name: '签到管理',
          href: '/staff/checkin',
          icon: ClipboardDocumentCheckIcon,
        },
        {
          name: '餐食管理',
          href: '/staff/meal',
          icon: CakeIcon,
        },
        // ... existing staff navigation items ...
      );
    }

    // ... existing code ...

    return navigation;
  };

  // ... existing code ...
} 