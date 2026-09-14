"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const body = document.body;

    const sidebar = document.getElementById("sidebar");
    const mobileMenu = document.getElementById("mobileMenu");

    const navItems = document.querySelectorAll(".nav-item");
    const pageButtons = document.querySelectorAll("[data-page]");
    const pages = document.querySelectorAll(".page");

    const projectModal = document.getElementById("projectModal");
    const loginModal = document.getElementById("loginModal");

    const newProjectButton =
        document.getElementById("newProjectButton");

    const newProjectButtonProjects =
        document.getElementById("newProjectButtonProjects");

    const projectForm =
        document.getElementById("projectForm");

    const loginForm =
        document.getElementById("loginForm");

    const themeButton =
        document.getElementById("themeButton");

    const darkModeSwitch =
        document.getElementById("darkModeSwitch");

    const notificationButton =
        document.getElementById("notificationButton");

    const notificationPanel =
        document.getElementById("notificationPanel");

    const closeNotifications =
        document.getElementById("closeNotifications");

    const profileButton =
        document.getElementById("profileButton");

    const logoutButton =
        document.getElementById("logoutButton");

    const editProfileButton =
        document.getElementById("editProfileButton");

    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById("toastMessage");

    const globalSearch =
        document.getElementById("globalSearch");


    /* ==========================
       NAVEGAÇÃO
    ========================== */

    function showPage(pageName) {

        pages.forEach((page) => {
            page.classList.remove("active-page");
        });

        const targetPage =
            document.getElementById(`page-${pageName}`);

        if (targetPage) {
            targetPage.classList.add("active-page");
        }

        navItems.forEach((item) => {

            if (item.dataset.page === pageName) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }

        });

        sidebar.classList.remove("mobile-open");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    pageButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const pageName =
                button.dataset.page;

            if (pageName) {
                showPage(pageName);
            }

        });

    });


    navItems.forEach((button) => {

        button.addEventListener("click", () => {

            showPage(button.dataset.page);

        });

    });


    /* ==========================
       MENU MOBILE
    ========================== */

    mobileMenu.addEventListener("click", () => {

        sidebar.classList.toggle("mobile-open");

    });


    document.addEventListener("click", (event) => {

        const clickedInsideSidebar =
            sidebar.contains(event.target);

        const clickedMenu =
            mobileMenu.contains(event.target);

        if (
            window.innerWidth <= 900 &&
            !clickedInsideSidebar &&
            !clickedMenu
        ) {
            sidebar.classList.remove("mobile-open");
        }

    });


    /* ==========================
       MODAIS
    ========================== */

    function openModal(modal) {

        if (!modal) {
            return;
        }

        modal.classList.add("open");

        document.body.style.overflow = "hidden";

    }


    function closeModal(modal) {

        if (!modal) {
            return;
        }

        modal.classList.remove("open");

        document.body.style.overflow = "";

    }


    function closeAllModals() {

        document
            .querySelectorAll(".modal-container.open")
            .forEach((modal) => {
                modal.classList.remove("open");
            });

        document.body.style.overflow = "";

    }


    newProjectButton.addEventListener("click", () => {

        openModal(projectModal);

    });


    newProjectButtonProjects.addEventListener("click", () => {

        openModal(projectModal);

    });


    document
        .querySelectorAll("[data-close-modal]")
        .forEach((button) => {

            button.addEventListener("click", () => {

                const modal =
                    button.closest(".modal-container");

                closeModal(modal);

            });

        });


    document
        .querySelectorAll(".modal-container")
        .forEach((modal) => {

            modal.addEventListener("click", (event) => {

                if (event.target === modal) {
                    closeModal(modal);
                }

            });

        });


    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {

            closeAllModals();

            notificationPanel.classList.remove("open");

        }

    });


    /* ==========================
       CRIAR PROJETO
    ========================== */

    projectForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const projectName =
            document
                .getElementById("projectName")
                .value
                .trim();

        const projectType =
            document
                .getElementById("projectType")
                .value;

        if (!projectName) {
            showToast("Digite o nome do projeto.");
            return;
        }

        closeModal(projectModal);

        projectForm.reset();

        showToast(
            `Projeto "${projectName}" criado com sucesso.`
        );

        setTimeout(() => {

            showPage("projetos");

        }, 700);

        console.log({
            nome: projectName,
            tipo: projectType
        });

    });


    /* ==========================
       FAVORITOS
    ========================== */

    const favoriteButtons =
        document.querySelectorAll(".favorite-toggle");

    favoriteButtons.forEach((button) => {

        button.addEventListener("click", (event) => {

            event.stopPropagation();

            button.classList.toggle("favorite-active");

            const icon =
                button.querySelector("i");

            if (
                button.classList.contains("favorite-active")
            ) {

                icon.classList.remove("fa-regular");
                icon.classList.add("fa-solid");

                showToast("Projeto adicionado aos favoritos.");

            } else {

                icon.classList.remove("fa-solid");
                icon.classList.add("fa-regular");

                showToast("Projeto removido dos favoritos.");

            }

        });

    });


    /* ==========================
       ABRIR PROJETO
    ========================== */

    const projectOpenButtons =
        document.querySelectorAll(".project-open");

    projectOpenButtons.forEach((button) => {

        button.addEventListener("click", (event) => {

            event.stopPropagation();

            showToast(
                "Área de visualização do projeto aberta."
            );

        });

    });


    /* ==========================
       FILTROS
    ========================== */

    const filterButtons =
        document.querySelectorAll(".filter-bar .filter-button");

    const allProjectCards =
        document.querySelectorAll(
            "#page-projetos .project-card"
        );


    filterButtons.forEach((button) => {

        button.addEventListener("click", () => {

            filterButtons.forEach((item) => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            const filter =
                button.dataset.filter;

            allProjectCards.forEach((card) => {

                const category =
                    card.dataset.category;

                if (
                    filter === "todos" ||
                    category === filter
                ) {

                    card.style.display = "";

                } else {

                    card.style.display = "none";

                }

            });

        });

    });


    const inspirationFilters =
        document.querySelectorAll(
            ".inspiration-filter .filter-button"
        );


    inspirationFilters.forEach((button) => {

        button.addEventListener("click", () => {

            inspirationFilters.forEach((item) => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            showToast(
                `Filtro "${button.textContent.trim()}" selecionado.`
            );

        });

    });


    /* ==========================
       TEMA
    ========================== */

    function updateThemeIcon() {

        const icon =
            themeButton.querySelector("i");

        if (body.classList.contains("dark")) {

            icon.classList.remove("fa-moon");
            icon.classList.add("fa-sun");

            darkModeSwitch.checked = true;

        } else {

            icon.classList.remove("fa-sun");
            icon.classList.add("fa-moon");

            darkModeSwitch.checked = false;

        }

    }


    function setTheme(isDark) {

        if (isDark) {

            body.classList.add("dark");

            localStorage.setItem(
                "novae-theme",
                "dark"
            );

        } else {

            body.classList.remove("dark");

            localStorage.setItem(
                "novae-theme",
                "light"
            );

        }

        updateThemeIcon();

    }


    const savedTheme =
        localStorage.getItem("novae-theme");

    if (savedTheme === "dark") {
        setTheme(true);
    } else {
        setTheme(false);
    }


    themeButton.addEventListener("click", () => {

        setTheme(
            !body.classList.contains("dark")
        );

    });


    darkModeSwitch.addEventListener("change", () => {

        setTheme(darkModeSwitch.checked);

    });


    /* ==========================
       NOTIFICAÇÕES
    ========================== */

    notificationButton.addEventListener("click", (event) => {

        event.stopPropagation();

        notificationPanel.classList.toggle("open");

    });


    closeNotifications.addEventListener("click", () => {

        notificationPanel.classList.remove("open");

    });


    document.addEventListener("click", (event) => {

        if (
            !notificationPanel.contains(event.target) &&
            !notificationButton.contains(event.target)
        ) {

            notificationPanel.classList.remove("open");

        }

    });


    /* ==========================
       PERFIL
    ========================== */

    profileButton.addEventListener("click", () => {

        showPage("perfil");

    });


    editProfileButton.addEventListener("click", () => {

        showToast(
            "Editor de perfil disponível nesta versão."
        );

    });


    /* ==========================
       LOGIN
    ========================== */

    loginForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const email =
            document
                .getElementById("loginEmail")
                .value
                .trim();

        if (!email) {
            showToast("Digite seu e-mail.");
            return;
        }

        closeModal(loginModal);

        loginForm.reset();

        showToast(
            "Login realizado com sucesso."
        );

    });


    /* ==========================
       LOGOUT
    ========================== */

    logoutButton.addEventListener("click", () => {

        showToast(
            "Sessão encerrada."
        );

        setTimeout(() => {

            openModal(loginModal);

        }, 600);

    });


    /* ==========================
       BUSCA
    ========================== */

    function searchProjects(query) {

        const normalizedQuery =
            query
                .toLowerCase()
                .trim();

        const cards =
            document.querySelectorAll(".project-card");

        let found = false;

        cards.forEach((card) => {

            const title =
                (
                    card.dataset.title ||
                    card.textContent
                ).toLowerCase();

            if (
                !normalizedQuery ||
                title.includes(normalizedQuery)
            ) {

                card.style.display = "";
                found = true;

            } else {

                card.style.display = "none";

            }

        });

        return found;

    }


    globalSearch.addEventListener("input", () => {

        const query =
            globalSearch.value;

        if (query.trim()) {

            showPage("projetos");

            const found =
                searchProjects(query);

            if (!found) {

                showToast(
                    "Nenhum projeto encontrado."
                );

            }

        } else {

            document
                .querySelectorAll(".project-card")
                .forEach((card) => {
                    card.style.display = "";
                });

        }

    });


    /* ==========================
       ATALHO CTRL + K
    ========================== */

    document.addEventListener("keydown", (event) => {

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

            globalSearch.focus();

        }

    });


    /* ==========================
       MAIS OPÇÕES
    ========================== */

    document
        .querySelectorAll(".more-button")
        .forEach((button) => {

            button.addEventListener("click", (event) => {

                event.stopPropagation();

                showToast(
                    "Menu de opções selecionado."
                );

            });

        });


    /* ==========================
       TOAST
    ========================== */

    let toastTimer;


    function showToast(message) {

        toastMessage.textContent = message;

        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer =
            setTimeout(() => {

                toast.classList.remove("show");

            }, 2800);

    }


    /* ==========================
       FAVORITOS - ATUALIZAÇÃO
    ========================== */

    function updateFavoriteState() {

        const favorites =
            document.querySelectorAll(
                ".favorite-toggle.favorite-active"
            );

        const emptyState =
            document.getElementById("favoritesEmpty");

        if (!emptyState) {
            return;
        }

        if (favorites.length > 0) {
            emptyState.style.display = "none";
        }

    }


    favoriteButtons.forEach((button) => {

        button.addEventListener(
            "click",
            updateFavoriteState
        );

    });


    /* ==========================
       ESTADO INICIAL
    ========================== */

    showPage("inicio");

});
