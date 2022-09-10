import useNavigation from '../../hooks/UseNavigation'

interface Props {
    className?: string
}

const NavigationOverlay = ({className}: Props) => {
    const {navbarOpen, setNavbarOpen} = useNavigation()

    return (
        <div
            className={`fixed w-full h-full transition-[background,visibility] z-30
            ${navbarOpen ? 'visible lg:!invisible bg-black/50' : 'invisible bg-transparent'} ${className}`}
            onClick={(e) => {
                if (navbarOpen) {
                    setNavbarOpen(false)
                    return
                }
                if (!navbarOpen && e.currentTarget.style.display != 'none') {
                    e.currentTarget.style.display = 'none'
                }
            }}
        ></div>
    )
}

export default NavigationOverlay